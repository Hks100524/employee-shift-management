const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const createAuditLog = require("../utils/auditLogger");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  buildRequestCacheKey,
  getCachedPayload,
  invalidateCacheNamespace,
  setCachedPayload,
} = require("../utils/cacheStore");
const { normalizeDateInput } = require("../utils/dateTime");
const { buildPaginationMeta, getPagination, buildSearchFilter } = require("../utils/queryFeatures");
const { optionalString, requiredString } = require("../utils/validation");

const ALLOWED_LEAVE_TYPES = [
  "casual",
  "sick",
  "annual",
  "maternity",
  "paternity",
  "unpaid",
  "other",
];

const getRequesterEmployeeId = (req) =>
  String(req.user.employee?._id || req.user.employee || "");

const calculateLeaveDays = (startDate, endDate) => {
  const milliseconds = endDate.getTime() - startDate.getTime();
  return Math.floor(milliseconds / 86400000) + 1;
};

const ensureManagerCanAct = async (req, employeeId) => {
  if (req.user.role !== "manager") {
    return;
  }

  const requesterEmployeeId = getRequesterEmployeeId(req);
  const employee = await Employee.findById(employeeId).select("manager");

  if (!employee || String(employee.manager || "") !== requesterEmployeeId) {
    throw new AppError("Managers can only review leave for their direct reports.", 403);
  }
};

const getLeaves = asyncHandler(async (req, res) => {
  const cacheKey = buildRequestCacheKey("leaves", req);
  const cachedPayload = getCachedPayload(cacheKey);

  if (cachedPayload) {
    return res.json(cachedPayload);
  }

  const { page, limit, skip } = getPagination(req.query);
  const filters = {
    ...buildSearchFilter(req.query.search, ['employee.name', 'reason']),
  };

  if (req.query.status) {
    filters.status = req.query.status;
  }

  if (req.query.leave_type) {
    filters.leaveType = req.query.leave_type;
  }

  if (req.query.employee_id) {
    filters.employee = req.query.employee_id;
  }

  if (req.query.start_date || req.query.end_date) {
    filters.startDate = {};

    if (req.query.start_date) {
      filters.startDate.$gte = normalizeDateInput(req.query.start_date, "start_date").date;
    }

    if (req.query.end_date) {
      filters.startDate.$lte = normalizeDateInput(req.query.end_date, "end_date").date;
    }
  }

  if (req.user.role === "employee") {
    const requesterEmployeeId = getRequesterEmployeeId(req);

    if (!requesterEmployeeId) {
      throw new AppError("Employee profile is not linked to this user.", 400);
    }

    filters.employee = requesterEmployeeId;
  }

  if (req.user.role === "manager") {
    const requesterEmployeeId = getRequesterEmployeeId(req);
    const reportIds = await Employee.find({ manager: requesterEmployeeId }).distinct("_id");

    if (req.query.employee_id) {
      if (!reportIds.map(String).includes(String(req.query.employee_id))) {
        filters.employee = null;
      }
    } else {
      filters.employee = { $in: reportIds };
    }
  }

  const [leaves, total] = await Promise.all([
    Leave.find(filters)
      .populate("employee", "name email department branch designation manager")
      .populate("actionedBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Leave.countDocuments(filters),
  ]);

  const payload = {
    success: true,
    data: leaves,
    pagination: buildPaginationMeta({ total, page, limit }),
  };

  setCachedPayload(cacheKey, payload);

  res.json(payload);
});

const applyLeave = asyncHandler(async (req, res) => {
  const employeeId = getRequesterEmployeeId(req);

  if (!employeeId) {
    throw new AppError("This user is not linked to an employee profile.", 400);
  }

  const leaveType = String(req.body.leave_type || req.body.leaveType || "casual").toLowerCase();

  if (!ALLOWED_LEAVE_TYPES.includes(leaveType)) {
    throw new AppError("Invalid leave type.", 400);
  }

  const startDate = normalizeDateInput(req.body.start_date || req.body.startDate, "start_date");
  const endDate = normalizeDateInput(req.body.end_date || req.body.endDate, "end_date");
  const reason = req.body.reason;

  if (endDate.date < startDate.date) {
    throw new AppError("end_date must be on or after start_date.", 400);
  }

  // Check for duplicate pending leave for same dates and type
  const pendingDuplicate = await Leave.findOne({
    employee: employeeId,
    leaveType,
    status: "pending",
    $or: [
      { 
        startDate: { $lte: endDate.date }, 
        endDate: { $gte: startDate.date } 
      },
      { 
        startDate: { $gte: startDate.date }, 
        endDate: { $lte: endDate.date } 
      }
    ]
  });

  if (pendingDuplicate) {
    throw new AppError(`Pending ${leaveType} leave already exists for these dates`, 409);
  }

  // Existing overlap check for approved/pending (different types ok)
  const overlap = await Leave.findOne({
    employee: employeeId,
    status: { $in: ["pending", "approved"] },
    startDate: { $lte: endDate.date },
    endDate: { $gte: startDate.date },
  });

  if (overlap) {
    throw new AppError("Overlapping leave request already exists.", 409);
  }

  const leave = await Leave.create({
    employee: employeeId,
    leaveType,
    startDate: startDate.date,
    endDate: endDate.date,
    reason,
    createdBy: req.user._id,
    totalDays: calculateLeaveDays(startDate.date, endDate.date),
  });

  const createdLeave = await Leave.findById(leave._id)
    .select('employee leaveType startDate endDate totalDays')
    .lean()
    .populate("employee", "name email department branch designation manager");

  await createAuditLog(req, {
    action: "leave.apply",
    entityType: "Leave",
    entityId: leave._id,
    metadata: { leaveType, totalDays: leave.totalDays },
  });

  invalidateCacheNamespace("leaves");

  res.status(201).json({
    success: true,
    message: "Leave applied successfully.",
    data: createdLeave,
  });
});

const approveLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id)
    .select('employee status reviewComment actionedBy actionedAt')
    .lean()
    .populate("employee", "name email");

  if (!leave) {
    throw new AppError("Leave request not found.", 404);
  }

  if (leave.status !== "pending") {
    throw new AppError("Only pending leave requests can be approved.", 400);
  }

  await ensureManagerCanAct(req, leave.employee._id);

  leave.status = "approved";
  leave.actionedBy = req.user._id;
  leave.actionedAt = new Date();
  leave.reviewComment = optionalString(req.body.comment);
  await leave.save();

  const updatedLeave = await Leave.findById(leave._id)
    .select('employee leaveType startDate endDate status reviewComment actionedBy actionedAt totalDays')
    .lean()
    .populate("employee", "name email department branch designation manager")
    .populate("actionedBy", "name email role");

  await createAuditLog(req, {
    action: "leave.approve",
    entityType: "Leave",
    entityId: leave._id,
    metadata: { employeeId: String(leave.employee._id) },
  });

  invalidateCacheNamespace("leaves");
  invalidateCacheNamespace("shifts");

  res.json({
    success: true,
    message: "Leave approved successfully.",
    data: updatedLeave,
  });
});

const rejectLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id)
    .select('employee status reviewComment actionedBy actionedAt')
    .lean()
    .populate("employee", "name email");

  if (!leave) {
    throw new AppError("Leave request not found.", 404);
  }

  if (leave.status !== "pending") {
    throw new AppError("Only pending leave requests can be rejected.", 400);
  }

  await ensureManagerCanAct(req, leave.employee._id);

  leave.status = "rejected";
  leave.actionedBy = req.user._id;
  leave.actionedAt = new Date();
  leave.reviewComment = optionalString(req.body.comment);
  await leave.save();

  const updatedLeave = await Leave.findById(leave._id)
    .select('employee leaveType startDate endDate status reviewComment actionedBy actionedAt totalDays')
    .lean()
    .populate("employee", "name email department branch designation manager")
    .populate("actionedBy", "name email role");

  await createAuditLog(req, {
    action: "leave.reject",
    entityType: "Leave",
    entityId: leave._id,
    metadata: { employeeId: String(leave.employee._id) },
  });

  invalidateCacheNamespace("leaves");

  res.json({
    success: true,
    message: "Leave rejected successfully.",
    data: updatedLeave,
  });
});

module.exports = {
  applyLeave,
  approveLeave,
  getLeaves,
  rejectLeave,
};
