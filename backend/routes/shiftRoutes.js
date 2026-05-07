const express = require("express");

const { createShift, deleteShift, getShifts, updateShift } = require("../controllers/shiftController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { createRules, updateRules } = require("../middleware/validators/shiftValidator");
const validationResultMiddleware = require("../middleware/validationResultMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Shifts
 */

/**
 * @swagger
 * /api/shifts:
 *   get:
 *     summary: Get shifts
 *     tags: [Shifts]
 */
router.get("/", protect, authorize("admin", "manager", "employee"), getShifts);

/**
 * @swagger
 * /api/shifts:
 *   post:
 *     summary: Create shift
 *     tags: [Shifts]
 */
router.post("/", protect, authorize("admin", "manager"), createRules, validationResultMiddleware, createShift);

/**
 * @swagger
 * /api/shifts/{id}:
 *   put:
 *     summary: Update shift
 *     tags: [Shifts]
 */
router.put("/:id", updateRules, protect, authorize("admin", "manager"), validationResultMiddleware, updateShift);

/**
 * @swagger
 * /api/shifts/{id}:
 *   delete:
 *     summary: Delete shift
 *     tags: [Shifts]
 */
router.delete("/:id", protect, authorize("admin", "manager"), deleteShift);

module.exports = router;
