const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Shift = require("../models/Shift");
const Attendance = require("../models/Attendance");
const ShiftAssignmentLock = require("../models/ShiftAssignmentLock");

const createAuditLog = require("../utils/auditLogger");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const {
  buildRequestCacheKey,
  getCachedPayload,
  invalidateCacheNamespace,
  setCachedPayload,
} = require("../utils/cacheStore");

const { getShiftWindow, normalizeDateInput } = require("../utils/dateTime");

const {
  buildPaginationMeta,
  getPagination,
  buildSearchFilter,
} = require("../utils/queryFeatures");

// ===================== HELPERS =====================
const getRequesterEmployeeId = (req) =>
  String(req.user.employee?._id || req.user.employee || "");

const getManagerEmployeeIds = async (req) => {
  if (req.user.role !== "manager") return null;

  const requesterEmployeeId = getRequesterEmployeeId(req);

  if (!requesterEmployeeId) {
    throw new AppError("Manager profile not linked.", 403);
  }

  const employees = await Employee.find({ manager: requesterEmployeeId })
    .select("_id")
    .lean();

  return employees.map((e) => String(e._id));
};

// ===================== GET SHIFTS (🔥 FIXED) =====================
const getShifts = asyncHandler(async (req, res) => {
  const cacheKey = buildRequestCacheKey("shifts", req);
  const cachedPayload = getCachedPayload(cacheKey);

  if (cachedPayload) return res.json(cachedPayload);

  const { page, limit, skip } = getPagination(req.query);

  const filters = {
    ...buildSearchFilter(req.query.search, ["branch", "employee.name", "employee.email", "employee.department"]),
  };

  // 🎯 Basic filters
  if (req.query.employee_id) filters.employee = req.query.employee_id;
  if (req.query.status) filters.status = req.query.status;
  if (req.query.branch) filters.branch = req.query.branch;

  // 🎯 Date filters
  if (req.query.shift_date) {
    filters.shiftDateKey = req.query.shift_date;
  }

  if (req.query.start_date || req.query.end_date) {
    filters.shiftDate = {};

    if (req.query.start_date) {
      filters.shiftDate.$gte = normalizeDateInput(
        req.query.start_date,
        "start_date"
      ).date;
    }

    if (req.query.end_date) {
      filters.shiftDate.$lte = normalizeDateInput(
        req.query.end_date,
        "end_date"
      ).date;
    }
  }

  // 🎯 Role-based restrictions
  if (req.user.role === "employee") {
    const id = getRequesterEmployeeId(req);
    if (!id) throw new AppError("Employee not linked.", 400);
    filters.employee = id;
  }

  if (req.user.role === "manager") {
    const managedIds = await getManagerEmployeeIds(req);

    if (req.query.employee_id) {
      if (!managedIds.includes(String(req.query.employee_id))) {
        filters.employee = null; // unauthorized
      }
    } else {
      filters.employee = { $in: managedIds };
    }
  }

  // 🎯 Sorting (dynamic)
  let sort = { shiftDate: 1, startMinutes: 1 };

  if (req.query.sort_by) {
    const order = req.query.order === "asc" ? 1 : -1;
    sort = { [req.query.sort_by]: order };
  }

  const [shifts, total] = await Promise.all([
    Shift.find(filters)
      .populate(
        "employee",
        "name email department branch designation status manager"
      )
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),

    Shift.countDocuments(filters),
  ]);

  const payload = {
    success: true,
    data: shifts,
    pagination: buildPaginationMeta({ total, page, limit }),
  };

  setCachedPayload(cacheKey, payload);

  res.json(payload);
});

// ===================== CREATE SHIFT =====================
const createShift = asyncHandler(async (req, res) => {
  const employeeId = req.body.employee_id;
  const shiftDate = normalizeDateInput(req.body.shift_date, "shift_date");
  const { startMinutes, endMinutes } = getShiftWindow(
    req.body.start_time,
    req.body.end_time
  );

  const lock = await ShiftAssignmentLock.create({
    employee: employeeId,
    shiftDateKey: shiftDate.key,
    expiresAt: new Date(Date.now() + 15000),
  });

  try {
    const shift = await Shift.create({
      employee: employeeId,
      shiftDate: shiftDate.date,
      shiftDateKey: shiftDate.key,
      startTime: req.body.start_time,
      endTime: req.body.end_time,
      startMinutes,
      endMinutes,
      branch: req.body.branch,
      status: "assigned",
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Shift created",
      data: shift,
    });
  } finally {
    await ShiftAssignmentLock.findByIdAndDelete(lock._id);
  }
});

// ===================== UPDATE SHIFT =====================
const updateShift = asyncHandler(async (req, res) => {
  const shift = await Shift.findById(req.params.id)
    .select('employee shiftDate shiftDateKey startTime endTime startMinutes endMinutes branch status')
    .lean();
  if (!shift) throw new AppError("Shift not found", 404);

  // Update via findByIdAndUpdate to avoid hydration
  const updatedShift = await Shift.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).select('employee shiftDate shiftDateKey startTime endTime startMinutes endMinutes branch status')
    .lean();

  res.json({
    success: true,
    message: "Shift updated",
    data: updatedShift,
  });
});

// ===================== DELETE SHIFT =====================
const deleteShift = asyncHandler(async (req, res) => {
  const shift = await Shift.findById(req.params.id).select('_id').lean();
  if (!shift) throw new AppError("Shift not found", 404);

  const attendance = await Attendance.findOne({ shift: shift._id }).select('_id').lean();
  if (attendance) {
    throw new AppError("Cannot delete shift with attendance", 409);
  }

  await Shift.findByIdAndDelete(shift._id);

  res.json({
    success: true,
    message: "Shift deleted",
  });
});

module.exports = {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
};
