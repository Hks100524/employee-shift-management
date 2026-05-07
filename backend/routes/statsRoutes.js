const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { getDashboardStats } = require('../controllers/statsController');

router.get('/dashboard', protect, authorize('admin', 'manager', 'employee'), getDashboardStats);

module.exports = router;
