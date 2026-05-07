const express = require("express");

const { applyLeave, approveLeave, getLeaves, rejectLeave } = require("../controllers/leaveController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { applyRules, approveRules, rejectRules } = require("../middleware/validators/leaveValidator");
const validationResultMiddleware = require("../middleware/validationResultMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Leaves
 */

/**
 * @swagger
 * /api/leaves:
 *   get:
 *     summary: Get leaves
 *     tags: [Leaves]
 */
router.get("/", protect, authorize("admin", "manager", "employee"), getLeaves);

/**
 * @swagger
 * /api/leaves:
 *   post:
 *     summary: Apply leave
 *     tags: [Leaves]
 */
router.post("/", protect, authorize("admin", "manager", "employee"), applyRules, validationResultMiddleware, applyLeave);

/**
 * @swagger
 * /api/leaves/{id}/approve:
 *   put:
 *     summary: Approve leave
 *     tags: [Leaves]
 */
router.put("/:id/approve", approveRules, protect, authorize("admin", "manager"), validationResultMiddleware, approveLeave);

/**
 * @swagger
 * /api/leaves/{id}/reject:
 *   put:
 *     summary: Reject leave
 *     tags: [Leaves]
 */
router.put("/:id/reject", rejectRules, protect, authorize("admin", "manager"), validationResultMiddleware, rejectLeave);

module.exports = router;
