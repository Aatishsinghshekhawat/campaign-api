const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/filter', authenticateToken, listController.listLists);
router.post('/add', authenticateToken, listController.addList);
router.put('/add/:id', authenticateToken, listController.updateList);
router.post('/:id', authenticateToken, listController.getListById);

module.exports = router;

