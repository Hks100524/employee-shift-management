const Employee = require("../models/Employee");
const User = require("../models/User");

const createAuditLog = require("../utils/auditLogger");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const generateToken = require("../utils/generateToken");

const parseDateValue = (value) => {
  if (!value) {
    return new Date();
  }

  if (typeof value !== "string") {
    return new Date(value);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(value);
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [day, month, year] = value.split("-");
    return new Date(`${year}-${month}-${day}`);
  }

  return new Date(value);
};

// ================= SANITIZE USER =================
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  employee: user.employee || null,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
});

// ================= REGISTER =================
const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    department,
    branch,
    designation,
    joining_date,
    joiningDate,
  } = req.body;

  const joiningDateValue = joiningDate || joining_date;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  // Check existing records before creating a new account.
  const existingUser = await User.findOne({ email: normalizedEmail }).lean();
  const existingEmployee = await Employee.findOne({ email: normalizedEmail }).lean();

  console.log("Register debug:", {
    email: normalizedEmail,
    hasUser: !!existingUser,
    userId: existingUser?._id,
    hasEmployee: !!existingEmployee,
    employeeId: existingEmployee?._id,
  });

  if (existingUser || existingEmployee) {
    // Detailed error response for frontend
    return res.status(409).json({
      success: false,
      message: "Account with this email already exists. Try login ->",
      details: {
        email: normalizedEmail,
        hasUserAccount: !!existingUser,
        hasEmployeeRecord: !!existingEmployee,
        userId: existingUser?._id,
        employeeId: existingEmployee?._id,
      },
    });
  }

  // 🔥 SAFE DATE HANDLE
  let finalJoiningDate = parseDateValue(joiningDateValue);
  if (Number.isNaN(finalJoiningDate.getTime())) {
    finalJoiningDate = new Date();
  }

  // 🔥 CREATE EMPLOYEE
  const employee = await Employee.create({
    name,
    email: normalizedEmail,
    department: department || "General",
    branch: branch || "Head Office",
    designation: designation || "Employee",
    joiningDate: finalJoiningDate,
    status: "active",
    createdBy: null,
  });

  console.log("Employee created:", employee._id);

  let user;

  try {
    user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: role || "employee",
      employee: employee._id,
      isActive: true,
    });
  } catch (error) {
    await Employee.findByIdAndDelete(employee._id);
    throw error;
  }

  // 🔥 LINK USER
  employee.user = user._id;
  await employee.save();

  const hydratedUser = await User.findById(user._id)
    .select("-password")
    .populate("employee");

  // 🔥 SAFE AUDIT (CRASH NA HO)
  try {
    await createAuditLog(req, {
      action: "auth.register",
      entityType: "User",
      entityId: user._id,
      metadata: { role: user.role },
    });
  } catch (err) {
    // ignore audit error
  }

  res.status(201).json({
    success: true,
    message: "Registration successful.",
    token: generateToken(hydratedUser),
    data: sanitizeUser(hydratedUser),
  });
});

// ================= LOGIN =================
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email })
    .select("+password")
    .populate("employee");

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isPasswordValid = await user.matchPassword(password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isActive || (user.employee && user.employee.status === "inactive")) {
    throw new AppError(
      "Your account is inactive. Please contact an administrator.",
      403
    );
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  try {
    await createAuditLog(req, {
      action: "auth.login",
      entityType: "User",
      entityId: user._id,
      metadata: { role: user.role },
    });
  } catch (err) {
    // ignore audit error
  }

  res.json({
    success: true,
    message: "Login successful.",
    token: generateToken(user),
    data: sanitizeUser(user),
  });
});

// ================= GET ME =================
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate({
      path: "employee",
      populate: {
        path: "manager",
        select: "name email designation",
      },
    });

  res.json({
    success: true,
    data: sanitizeUser(user),
  });
});

// ================= LOGOUT =================
const logout = asyncHandler(async (req, res) => {
  try {
    await createAuditLog(req, {
      action: "auth.logout",
      entityType: "User",
      entityId: req.user._id,
      metadata: { role: req.user.role },
    });
  } catch (err) {
    // ignore audit error
  }

  res.json({
    success: true,
    message: "Logout successful.",
  });
});

module.exports = {
  getMe,
  login,
  logout,
  register,
};
