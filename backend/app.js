const cors = require("cors");
const express = require("express");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const statsRoutes = require("./routes/statsRoutes");

const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((item) => item.trim())
  : "*";

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= BASIC ROUTES =================
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Employee Shift Scheduling API is running.",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ================= API ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api", authRoutes);

app.use("/api/employees", employeeRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/stats", statsRoutes);

// ================= 🔥 SWAGGER (IMPORTANT POSITION) =================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ================= ERROR HANDLER (ALWAYS LAST) =================
app.use(notFound);
app.use(errorHandler);

module.exports = app;