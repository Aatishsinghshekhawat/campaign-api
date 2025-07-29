const service = require('../services/templateService');
const { validationResult } = require('express-validator');

exports.createTemplate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array()[0].msg });
  }
  const { title, status } = req.body;
  try {
    const newTpl = await service.createTemplate({ title, status });
    res.status(201).json(newTpl);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.filterTemplates = async (req, res) => {
  const { page, limit, title, status } = req.body;
  try {
    const [list, total] = await service.getTemplates({ page, limit, title, status });
    res.json({ templates: list, total });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getTemplateById = async (req, res) => {
  try {
    const tpl = await service.getTemplateById(req.params.id);
    res.json(tpl);
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    await service.updateTemplate(req.params.id, { content: req.body.content });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.toggleTemplateStatus = async (req, res) => {
  try {
    const newTpl = await service.toggleTemplateStatus(req.params.id);
    res.json({ status: newTpl.status });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
