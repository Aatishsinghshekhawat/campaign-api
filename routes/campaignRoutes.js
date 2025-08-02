const express = require('express');
const router = express.Router();
const controller = require('../controllers/campaignController');
const authenticateToken = require('../middleware/authMiddleware');
const { createCampaignValidator, updateCampaignValidator } = require('../validators/campaignValidator');
const validateRequest = require('../middleware/validateRequest');

router.post('/create', authenticateToken, createCampaignValidator, validateRequest, controller.createCampaign);

router.post('/list', authenticateToken, controller.getCampaigns);

router.get('/:id', authenticateToken, controller.getCampaignById);

router.put('/update/:id', authenticateToken, updateCampaignValidator, validateRequest, controller.updateCampaign);

router.delete('/delete/:id', authenticateToken, controller.deleteCampaign);

router.post('/copy/:id', authenticateToken, controller.copyCampaign);

module.exports = router;
