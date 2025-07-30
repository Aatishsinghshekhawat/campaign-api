const service = require('../services/campaignService');
const { validationResult } = require('express-validator');

exports.createCampaign = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array()[0].msg });
  }
  try {
    const newCampaign = await service.createCampaign(req.body);
    res.status(201).json(newCampaign);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getCampaigns = async (req, res) => {
  const { page, limit, name } = req.body;
  try {
    const [list, total] = await service.getCampaigns({ page, limit, name });
    res.json({ campaigns: list, total });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await service.getCampaignById(req.params.id);
    res.json(campaign);
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    await service.updateCampaign(req.params.id, req.body);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    await service.deleteCampaign(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};

exports.copyCampaign = async (req, res) => {
  try {
    const copyResult = await service.copyCampaign(req.params.id);
    res.json({ success: true, ...copyResult });
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};
