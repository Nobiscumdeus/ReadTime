const express = require('express');
const router = express.Router();
const dataController = require('../controllers/data.controller');
const { authMiddleware } = require('../middleware/authenticate');

router.post('/save', authMiddleware, dataController.saveReading);
router.delete('/:date', authMiddleware, dataController.deleteReading);
router.get('/:month', authMiddleware, dataController.getMonthlyData);

module.exports = router;