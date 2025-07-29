const express = require('express');
const router = express.Router();
const listItemController = require('../controllers/listItemController');
const authenticateToken = require('../middleware/authMiddleware');
const { validateListIdParam, validateItemIdParam, validateCsvRows } = require('../validators/listItemValidator');

router.post('/filter', authenticateToken, listItemController.filter);
router.post('/add', authenticateToken, listItemController.add);
router.put('/update/:id', authenticateToken, validateItemIdParam, listItemController.update);
router.get('/:id', authenticateToken, validateItemIdParam, listItemController.getById);
router.post('/upload/:listId', authenticateToken, validateListIdParam, validateCsvRows, listItemController.upload);
router.delete('/:id', authenticateToken, validateItemIdParam, listItemController.delete);
router.post('/meta/:id', authenticateToken, validateListIdParam, listItemController.getMeta);

module.exports = router;
