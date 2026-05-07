const express = require("express");

const {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} = require("../controllers/employeeController");

const { protect, authorize } = require("../middleware/authMiddleware");

const {
  createRules,
  updateRules,
} = require("../middleware/validators/employeeValidator");

const validationResultMiddleware = require("../middleware/validationResultMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Employees
 */

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
 */
router.get("/", protect, authorize("admin", "manager"), getEmployees);

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create employee
 *     tags: [Employees]
 */
router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  createRules,
  validationResultMiddleware,
  createEmployee
);

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Update employee
 *     tags: [Employees]
 */
router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  updateRules,
  validationResultMiddleware,
  updateEmployee
);

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Delete employee
 *     tags: [Employees]
 */
router.delete("/:id", protect, authorize("admin"), deleteEmployee);

module.exports = router;