const listService = require('../services/listService');

exports.addList = (req, res) => {
  const { name } = req.body;
  const createdDate = new Date();
  const modifiedDate = new Date();

  const sql = `INSERT INTO list (name, createdDate, modifiedDate) VALUES (?, ?, ?)`;
  const { connection: db } = require('../config/db');
  db.query(sql, [name, createdDate, modifiedDate], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database insert error', error: err });
    res.status(201).json({ message: 'List added', listId: result.insertId });
  });
};

exports.updateList = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const modifiedDate = new Date();

  const sql = `UPDATE list SET name = ?, modifiedDate = ? WHERE id = ?`;
  const { connection: db } = require('../config/db');
  db.query(sql, [name, modifiedDate, id], (err) => {
    if (err) return res.status(500).json({ message: 'Database update error', error: err });
    res.json({ message: 'List updated successfully' });
  });
};

exports.getListById = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT id, name, createdDate, modifiedDate FROM list WHERE id = ?`;
  const { connection: db } = require('../config/db');
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (result.length === 0) return res.status(404).json({ message: 'List not found' });
    res.json(result[0]);
  });
};

exports.listLists = async (req, res) => {
  try {
    const result = await listService.listLists(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
