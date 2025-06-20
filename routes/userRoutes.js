const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/add', authenticateToken, userController.addUser);
router.get('/list', authenticateToken, userController.listUsers);
router.put('/add/:id', authenticateToken, userController.updateUser);
router.get('/:id', authenticateToken, userController.getUserById);
router.put('/:id', authenticateToken, userController.updateUser);

module.exports = router;

