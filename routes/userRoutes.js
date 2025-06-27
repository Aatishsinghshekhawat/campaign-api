const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { validateUserCreation } = require('../validators/userValidator');

router.get('/list', authenticateToken, userController.listUsers);
router.post('/add', authenticateToken, validateUserCreation, validateRequest, userController.addUser);
router.put('/add/:id', authenticateToken, userController.updateUser); 
router.get('/:id', authenticateToken, userController.getUserById);



module.exports = router;

