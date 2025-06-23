const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/filter', authenticateToken, listController.filterLists);
router.post('/add', authenticateToken, listController.addList);
router.put('/add/:id', authenticateToken, listController.updateList);
router.get('/:id', authenticateToken, listController.getListById);

module.exports = router;
