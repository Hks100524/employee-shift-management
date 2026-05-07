const express = require("express");

const { checkIn, checkOut, getMyAttendance } = require("../controllers/attendanceController");

const { protect } = require("../middleware/authMiddleware");
const { checkInRules, checkOutRules } = require("../middleware/validators/attendanceValidator");
const validationResultMiddleware = require("../middleware/validationResultMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 */

/**
 * @swagger
 * /api/attendance/checkin:
 *   post:
 *     summary: Check-in
 *     tags: [Attendance]
 */
router.post("/checkin", protect, checkInRules, validationResultMiddleware, checkIn);

/**
 * @swagger
 * /api/attendance/checkout:
 *   post:
 *     summary: Check-out
 *     tags: [Attendance]
 */
router.post("/checkout", protect, checkOutRules, validationResultMiddleware, checkOut);

/**
 * @swagger
 * /api/attendance/me:
 *   get:
 *     summary: Get attendance
 *     tags: [Attendance]
 */
router.get("/me", protect, getMyAttendance);

/**
 * @swagger
 * /api/attendance/checkin:
 *   post:
 *     summary: Check-in
 *     tags: [Attendance]
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: true
 *         schema:
 *           type: string
 */

module.exports = router;
