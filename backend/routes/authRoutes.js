const express = require("express");

const { getMe, login, logout, register } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { register: validateRegister, login: validateLogin } = require("../middleware/validators/authValidator");
const validationResultMiddleware = require("../middleware/validationResultMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: User registered
 */
router.post("/register", validateRegister, validationResultMiddleware, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login success
 */
router.post("/login", validateLogin, validationResultMiddleware, login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 */
router.post("/logout", protect, logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get logged in user
 *     tags: [Auth]
 */
router.get("/me", protect, getMe);

module.exports = router;

