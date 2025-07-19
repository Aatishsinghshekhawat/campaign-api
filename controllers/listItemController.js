const listItemService = require('../services/listItemService');
const { connection: db } = require('../config/db');

exports.addListItem = async (req, res) => {
  try {
    const result = await listItemService.addListItem(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Insert error', error: error.message });
  }
};

exports.updateListItem = async (req, res) => {
  try {
    const result = await listItemService.updateListItem({ id: req.params.id, ...req.body });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Update error', error: error.message });
  }
};

exports.getListItemById = async (req, res) => {
  try {
    const result = await listItemService.getListItemById(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.filterListItems = async (req, res) => {
  try {
    const result = await listItemService.filterListItems(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Fetch error', error: error.message });
  }
};


exports.getListMetaById = async (req, res) => {
  try {
    const result = await listItemService.getListMetaById(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
