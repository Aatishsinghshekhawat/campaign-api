const express = require('express');
const router = express.Router();
const listItemController = require('../controllers/listItemController');
const authenticateToken = require('../middleware/authMiddleware');
// const upload = require('../middleware/uploadMiddleware'); 

router.post('/filter', authenticateToken, listItemController.filterListItems);
router.post('/add', authenticateToken, listItemController.addListItem);
router.put('/add/:id', authenticateToken, listItemController.updateListItem);
router.post('/:id', authenticateToken, listItemController.getListItemById);

router.post('/meta/:id', authenticateToken, listItemController.getListMetaById);

module.exports = router;
