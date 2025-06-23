const { connection: db } = require('../config/db');

exports.addList = (req, res) => {
  const { name } = req.body;
  const createdDate = new Date();
  const modifiedDate = new Date();

  const sql = `INSERT INTO list (name, createdDate, modifiedDate) VALUES (?, ?, ?)`;
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
  db.query(sql, [name, modifiedDate, id], (err) => {
    if (err) return res.status(500).json({ message: 'Database update error', error: err });
    res.json({ message: 'List updated successfully' });
  });
};

exports.getListById = (req, res) => {
  const { id } = req.params;

  const sql = `SELECT id, name, createdDate, modifiedDate FROM list WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (result.length === 0) return res.status(404).json({ message: 'List not found' });
    res.json(result[0]);
  });
};

exports.filterLists = (req, res) => {
  const { name = '', page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const filterQuery = `SELECT id, name, createdDate, modifiedDate FROM list WHERE name LIKE ? LIMIT ? OFFSET ?`;
  const countQuery = `SELECT COUNT(*) as total FROM list WHERE name LIKE ?`;

  db.query(countQuery, [`%${name}%`], (err, countResult) => {
    if (err) return res.status(500).json({ message: 'Count error', error: err });
    const total = countResult[0].total;

    db.query(filterQuery, [`%${name}%`, +limit, +offset], (err, result) => {
      if (err) return res.status(500).json({ message: 'Filter error', error: err });
      res.json({ total, page: +page, limit: +limit, lists: result });
    });
  });
};
