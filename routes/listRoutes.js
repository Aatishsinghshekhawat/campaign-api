const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const authenticateToken = require('../middleware/authMiddleware');
const { validateListIdParam, validateListNameBody, validateListFilter } = require('../validators/listValidator');

router.post('/filter', authenticateToken, validateListFilter, listController.list);

router.post('/add', authenticateToken, validateListNameBody, listController.add);

router.put('/update/:id', authenticateToken, validateListIdParam, validateListNameBody, listController.update);

router.get('/:id', authenticateToken, validateListIdParam, listController.getListWithItems);

router.delete('/:id', authenticateToken, validateListIdParam, listController.delete);

module.exports = router;
