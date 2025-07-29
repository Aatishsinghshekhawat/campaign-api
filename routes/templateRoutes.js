const express = require('express');
const router = express.Router();
const controller = require('../controllers/templateController');
const authenticateToken = require('../middleware/authMiddleware');
const { createTemplateValidator } = require('../validators/templateValidator');

router.post('/add', authenticateToken, createTemplateValidator, controller.createTemplate);

router.post('/filter', authenticateToken, controller.filterTemplates);
router.get('/:id', authenticateToken, controller.getTemplateById);
router.put('/update/:id', authenticateToken, controller.updateTemplate);
router.put('/toggle/:id', authenticateToken, controller.toggleTemplateStatus);

module.exports = router;
