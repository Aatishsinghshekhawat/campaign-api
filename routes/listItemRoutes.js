const express = require('express');
const router = express.Router();
const listItemController = require('../controllers/listItemController');
const authenticateToken = require('../middleware/authMiddleware');
// const upload = require('../middleware/uploadMiddleware'); 

router.get('/filter', authenticateToken, listItemController.filterListItems);
router.post('/add', authenticateToken, listItemController.addListItem);
router.put('/add/:id', authenticateToken, listItemController.updateListItem);
router.get('/:id', authenticateToken, listItemController.getListItemById);

router.get('/meta/:id', authenticateToken, listItemController.getListMetaById);

module.exports = router;
