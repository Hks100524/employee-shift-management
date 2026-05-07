const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Shift = require("../models/Shift");
const Attendance = require("../models/Attendance");

const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const {
  buildRequestCacheKey,
  getCachedPayload,
  setCachedPayload,
} = require("../utils/cacheStore");
const { getDateKey } = require("../utils/dateTime");

const getRequesterEmployeeId = (req) => String(req.user.employee?._id || req.user.employee || "");

const getDashboardStats = asyncHandler(async (req, res) => {
  const cacheKey = buildRequestCacheKey("stats", req);
  const cachedPayload = getCachedPayload(cacheKey);

  if (cachedPayload) {
    return res.json(cachedPayload);
  }

  const todayKey = getDateKey();
  const userRole = req.user.role;

  // Common matches
  const todayShiftsMatch = { 
    shiftDateKey: todayKey, 
    status: "assigned" 
  };

  // Manager managed employees
  let managedCount = 0;
  if (userRole === "manager") {
    const managerId = getRequesterEmployeeId(req);
    managedCount = await Employee.countDocuments({ manager: managerId });
  }

  // Parallel aggregations
  const [employeeAgg, leaveAgg, shiftAgg, attendanceAgg] = await Promise.all([
    // Employees total/active/inactive
    Employee.aggregate([
      { 
        $group: { 
          _id: null,
          totalEmployees: { $sum: 1 },
          activeEmployees: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          inactiveEmployees: { $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] } },
        } 
      }
    ]),

    // Pending leaves (scoped for manager/employee)
    Leave.aggregate([
      { 
        $match: userRole === "manager" 
          ? { 
              status: "pending",
              employee: { 
                $in: await Employee.find({ manager: getRequesterEmployeeId(req) }).distinct("_id") 
              }
            } 
          : userRole === "employee"
            ? { status: "pending", employee: getRequesterEmployeeId(req) }
            : { status: "pending" }
      },
      { $count: "pendingLeaves" }
    ]),

    // Today's shifts
    Shift.aggregate([
      { $match: todayShiftsMatch },
      { $count: "todaysShifts" }
    ]),

    // Today's attendance summary
    Attendance.aggregate([
      { $match: { attendanceDateKey: todayKey } },
      {
        $group: {
          _id: null,
          presentCount: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          partialCount: { $sum: { $cond: [{ $eq: ["$status", "partial"] }, 1, 0] } },
          totalToday: { $sum: 1 },
        }
      }
    ])
  ]);

  const statsData = {
    totalEmployees: employeeAgg[0]?.totalEmployees || 0,
    activeEmployees: employeeAgg[0]?.activeEmployees || 0,
    inactiveEmployees: employeeAgg[0]?.inactiveEmployees || 0,
    todaysShifts: shiftAgg[0]?.todaysShifts || 0,
    pendingLeaves: leaveAgg[0]?.pendingLeaves || 0,
    attendanceSummary: {
      present: attendanceAgg[0]?.presentCount || 0,
      partial: attendanceAgg[0]?.partialCount || 0,
      absent: (attendanceAgg[0]?.totalToday || 0) - (attendanceAgg[0]?.presentCount || 0) - (attendanceAgg[0]?.partialCount || 0),
    },
    ...(userRole === "manager" && { managedEmployees: managedCount }),
  };

  const stats = {
    success: true,
    data: statsData,
  };

  setCachedPayload(cacheKey, stats);
  res.json(stats);
});

module.exports = {
  getDashboardStats,
};

