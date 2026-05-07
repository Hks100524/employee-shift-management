const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Shift = require("../models/Shift");
const User = require("../models/User");

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
const {
  buildPaginationMeta,
  buildSearchFilter,
  buildSort,
  getPagination,
} = require("../utils/queryFeatures");

const {
  normalizeEmail,
  optionalString,
  requiredString,
} = require("../utils/validation");

const ALLOWED_ROLES = ["admin", "manager", "employee"];

const getRequesterEmployeeId = (req) =>
  String(req.user.employee?._id || req.user.employee || "");

// ========================== HELPER: ENSURE EMAIL AVAILABLE ==========================
const ensureEmailAvailable = async (email) => {
  const existingEmployee = await Employee.findOne({ email });
  if (existingEmployee) {
    throw new AppError(`Email '${email}' is already in use`, 400);
  }
};

// ========================== GET EMPLOYEES (🔥 FIXED) ==========================
const getEmployees = asyncHandler(async (req, res) => {
  const cacheKey = buildRequestCacheKey("employees", req);
  const cachedPayload = getCachedPayload(cacheKey);

  if (cachedPayload) {
    return res.json(cachedPayload);
  }

  const { page, limit, skip } = getPagination(req.query);

  // 🔥 Base filters + search
  const filters = {
    ...buildSearchFilter(req.query.search, [
      "name",
      "email",
      "department",
      "branch",
      "designation",
    ]),
  };

  // 🔥 Exact filters
  if (req.query.department) filters.department = req.query.department;
  if (req.query.branch) filters.branch = req.query.branch;
  if (req.query.status) filters.status = req.query.status;

  if (req.query.manager_id) {
    filters.manager = req.query.manager_id;
  }

  // 🔥 Manager scope restriction
  if (req.user.role === "manager") {
    filters.manager = getRequesterEmployeeId(req);
  }

  // 🔥 Date filter (joining date)
  if (req.query.start_date || req.query.end_date) {
    filters.joiningDate = {};

    if (req.query.start_date) {
      filters.joiningDate.$gte = normalizeDateInput(
        req.query.start_date,
        "start_date"
      ).date;
    }

    if (req.query.end_date) {
      filters.joiningDate.$lte = normalizeDateInput(
        req.query.end_date,
        "end_date"
      ).date;
    }
  }

  // 🔥 Sorting (dynamic)
  const sort = buildSort(req.query, { createdAt: -1 });

  // 🔥 Query execution (optimized)
  const [employees, total] = await Promise.all([
    Employee.find(filters)
      .populate("manager", "name email designation branch")
      .populate("user", "role isActive")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),

    Employee.countDocuments(filters),
  ]);

  const payload = {
    success: true,
    data: employees,
    pagination: buildPaginationMeta({ total, page, limit }),
  };

  setCachedPayload(cacheKey, payload);

  res.json(payload);
});

// ========================== CREATE ==========================
const createEmployee = asyncHandler(async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const department = req.body.department;
  const branch = req.body.branch;
  const designation = req.body.designation;

  const joiningDate = normalizeDateInput(
    req.body.joining_date || req.body.joiningDate,
    "joining_date"
  ).date;

  const status = req.body.status || "active";
  const password = req.body.password || undefined;

  await ensureEmailAvailable(email);

  const manager = optionalString(req.body.manager_id || req.body.managerId);

  const employee = await Employee.create({
    name,
    email,
    department,
    branch,
    designation,
    joiningDate,
    status,
    manager: manager || null,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Employee created successfully.",
    data: employee,
  });
});

// ========================== UPDATE ==========================
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    throw new AppError("Employee not found.", 404);
  }

  Object.assign(employee, req.body);
  await employee.save();

  res.json({
    success: true,
    message: "Employee updated successfully.",
    data: employee,
  });
});

// ========================== DELETE ==========================
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    throw new AppError("Employee not found.", 404);
  }

  await Employee.findByIdAndDelete(employee._id);

  res.json({
    success: true,
    message: "Employee deleted successfully.",
  });
});

module.exports = {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
};
