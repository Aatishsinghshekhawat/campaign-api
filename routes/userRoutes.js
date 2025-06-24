const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { validateUserCreation } = require('../validators/userValidator');

router.post('/add', authenticateToken, validateUserCreation, validateRequest, userController.addUser);
router.get('/list', authenticateToken, userController.listUsers);
router.get('/user/:id', authenticateToken, userController.listUsers);


module.exports = router;

