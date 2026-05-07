const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Shift = require("../models/Shift");
const IdempotencyKey = require("../models/IdempotencyKey");

const createAuditLog = require("../utils/auditLogger");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const {
  buildRequestCacheKey,
  getCachedPayload,
  invalidateCacheNamespace,
  setCachedPayload,
} = require("../utils/cacheStore");

const {
  calculateWorkingMinutes,
  getDateKey,
  minutesToHours,
  normalizeDateInput,
} = require("../utils/dateTime");

const {
  buildPaginationMeta,
  getPagination,
  buildSearchFilter,
} = require("../utils/queryFeatures");

const getRequesterEmployeeId = (req) =>
  String(req.user.employee?._id || req.user.employee || "");

const getAttendanceDateForToday = () => {
  const key = getDateKey();
  const normalized = normalizeDateInput(key, "attendance_date");

  return {
    date: normalized.date,
    key,
  };
};

const ensureSelfEmployee = async (req) => {
  const employeeId = getRequesterEmployeeId(req);

  if (!employeeId) {
    throw new AppError("This user is not linked to an employee profile.", 400);
  }

  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new AppError("Employee profile not found.", 404);
  }

  if (employee.status !== "active") {
    throw new AppError("Inactive employees cannot record attendance.", 403);
  }

  return employee;
};



// ================== ✅ CHECK-IN ==================
const checkIn = asyncHandler(async (req, res) => {
  const employee = await ensureSelfEmployee(req);

  const requestId =
    req.get("Idempotency-Key") || req.body.idempotency_key || null;

  if (!requestId) {
    throw new AppError("Idempotency-Key header is required.", 400);
  }

  // 🔁 Idempotency check
  const existingKey = await IdempotencyKey.findOne({
    key: requestId,
    user: req.user._id,
    endpoint: "checkin",
  });

  if (existingKey) {
    return res.json(existingKey.response);
  }

  const today = getAttendanceDateForToday();

  let attendance = await Attendance.findOne({
    employee: employee._id,
    attendanceDateKey: today.key,
  }).populate("shift");

  if (attendance?.checkInAt) {
    throw new AppError("Multiple check-ins are not allowed.", 409);
  }

  const assignedShift = await Shift.findOne({
    employee: employee._id,
    shiftDateKey: today.key,
    status: "assigned",
  })
    .select('startTime endTime branch status')
    .sort({ startMinutes: 1 })
    .lean();

  if (!attendance) {
    attendance = new Attendance({
      employee: employee._id,
      attendanceDate: today.date,
      attendanceDateKey: today.key,
      shift: assignedShift?._id || null,
    });
  }

  attendance.checkInAt = new Date();
  attendance.status = "partial";
  attendance.checkInRequestId = requestId;
  attendance.shift = attendance.shift || assignedShift?._id || null;

  await attendance.save();

  const createdAttendance = await Attendance.findById(attendance._id)
    .select('employee attendanceDate status checkInAt checkOutAt workingMinutes shift')
    .lean()
    .populate("shift", "shiftDateKey startTime endTime branch status");

  const responsePayload = {
    success: true,
    message: "Check-in recorded successfully.",
    data: createdAttendance,
  };

  // 🔥 Save response for idempotency
  await IdempotencyKey.create({
    key: requestId,
    user: req.user._id,
    endpoint: "checkin",
    response: responsePayload,
  });

  await createAuditLog(req, {
    action: "attendance.checkin",
    entityType: "Attendance",
    entityId: attendance._id,
    metadata: { attendanceDate: today.key, requestId },
  });

  invalidateCacheNamespace("attendance");

  res.json(responsePayload);
});



// ================== ✅ CHECK-OUT ==================
const checkOut = asyncHandler(async (req, res) => {
  const employee = await ensureSelfEmployee(req);

  const requestId =
    req.get("Idempotency-Key") || req.body.idempotency_key || null;

  if (!requestId) {
    throw new AppError("Idempotency-Key header is required.", 400);
  }

  const existingKey = await IdempotencyKey.findOne({
    key: requestId,
    user: req.user._id,
    endpoint: "checkout",
  });

  if (existingKey) {
    return res.json(existingKey.response);
  }

  const today = getAttendanceDateForToday();

  const attendance = await Attendance.findOne({
    employee: employee._id,
    attendanceDateKey: today.key,
  }).populate("shift");

  if (!attendance || !attendance.checkInAt) {
    throw new AppError("Cannot checkout before check-in.", 400);
  }

  if (attendance.checkOutAt) {
    throw new AppError("Checkout has already been recorded.", 409);
  }

  attendance.checkOutAt = new Date();
  attendance.checkOutRequestId = requestId;
  attendance.workingMinutes = calculateWorkingMinutes(
    attendance.checkInAt,
    attendance.checkOutAt
  );
  attendance.status = "present";

  await attendance.save();

  const updatedAttendance = await Attendance.findById(attendance._id)
    .select('employee attendanceDate status checkInAt checkOutAt workingMinutes shift')
    .lean()
    .populate("shift", "shiftDateKey startTime endTime branch status");

  const responsePayload = {
    success: true,
    message: "Checkout recorded successfully.",
    data: updatedAttendance,
  };

  await IdempotencyKey.create({
    key: requestId,
    user: req.user._id,
    endpoint: "checkout",
    response: responsePayload,
  });

  await createAuditLog(req, {
    action: "attendance.checkout",
    entityType: "Attendance",
    entityId: attendance._id,
    metadata: { attendanceDate: today.key, requestId },
  });

  invalidateCacheNamespace("attendance");

  res.json(responsePayload);
});



// ================== GET MY ATTENDANCE ==================
const getMyAttendance = asyncHandler(async (req, res) => {
  const cacheKey = buildRequestCacheKey("attendance", req);
  const cachedPayload = getCachedPayload(cacheKey);

  if (cachedPayload) {
    return res.json(cachedPayload);
  }

  const employeeId = getRequesterEmployeeId(req);

  if (!employeeId) {
    throw new AppError("This user is not linked to an employee profile.", 400);
  }

  const { page, limit, skip } = getPagination(req.query);

  const filters = { 
    employee: employeeId,
    ...buildSearchFilter(req.query.search, ['employee.name', 'employee.email']),
  };

  if (req.query.start_date || req.query.end_date) {
    filters.attendanceDate = {};

    if (req.query.start_date) {
      filters.attendanceDate.$gte = normalizeDateInput(req.query.start_date, "start_date").date;
    }

    if (req.query.end_date) {
      filters.attendanceDate.$lte = normalizeDateInput(req.query.end_date, "end_date").date;
    }
  }

  const [attendance, total, summary] = await Promise.all([
    Attendance.find(filters)
      .populate("shift", "shiftDateKey startTime endTime branch status")
      .sort({ attendanceDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Attendance.countDocuments(filters),

    Attendance.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          totalWorkingMinutes: { $sum: "$workingMinutes" },
          totalDays: { $sum: 1 },
        },
      },
    ]),
  ]);

  const payload = {
    success: true,
    data: attendance,
    summary: {
      totalDays: summary[0]?.totalDays || 0,
      totalWorkingMinutes: summary[0]?.totalWorkingMinutes || 0,
      totalWorkingHours: minutesToHours(summary[0]?.totalWorkingMinutes || 0),
    },
    pagination: buildPaginationMeta({ total, page, limit }),
  };

  setCachedPayload(cacheKey, payload);

  res.json(payload);
});

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
};


