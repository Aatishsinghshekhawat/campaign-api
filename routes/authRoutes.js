const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/verify', authenticateToken, authController.verify);

module.exports = router;
