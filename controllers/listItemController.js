const listItemService = require('../services/listItemService');
const Papa = require('papaparse');

exports.add = async (req, res) => {
  try {
    const result = await listItemService.add(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await listItemService.update({ id: req.params.id, ...req.body });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await listItemService.getById(req.params.id);
    res.json(item);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.filter = async (req, res) => {
  try {
    const data = await listItemService.filter(req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMeta = async (req, res) => {
  try {
    const meta = await listItemService.getMeta(req.params.id);
    res.json(meta);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Handles CSV upload, validates, inserts items with status set accordingly
exports.upload = async (req, res) => {
  const { listId } = req.params;
  const rows = req.body.rows;

  if (!listId || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ message: 'Invalid upload data: listId and rows are required.' });
  }

  try {
    const result = await listItemService.processCsvUpload(listId, rows);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;

  try {
    await listItemService.delete(id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
