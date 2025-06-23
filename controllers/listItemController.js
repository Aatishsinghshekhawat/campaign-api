const { connection: db } = require('../config/db');

exports.addListItem = (req, res) => {
  const { list_id, email, variables } = req.body;
  const createdDate = new Date();
  const modifiedDate = new Date();

  const sql = `INSERT INTO list_item (list_id, email, variables, createdDate, modifiedDate)
               VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [list_id, email, JSON.stringify(variables), createdDate, modifiedDate], (err, result) => {
    if (err) return res.status(500).json({ message: 'Insert error', error: err });
    res.status(201).json({ message: 'List item added', itemId: result.insertId });
  });
};

exports.updateListItem = (req, res) => {
  const { id } = req.params;
  const { list_id, email, variables } = req.body;
  const modifiedDate = new Date();

  const sql = `UPDATE list_item SET list_id = ?, email = ?, variables = ?, modifiedDate = ? WHERE id = ?`;

  db.query(sql, [list_id, email, JSON.stringify(variables), modifiedDate, id], (err) => {
    if (err) return res.status(500).json({ message: 'Update error', error: err });
    res.json({ message: 'List item updated successfully' });
  });
};

exports.getListItemById = (req, res) => {
  const { id } = req.params;

  const sql = `SELECT id, list_id, email, variables, createdDate, modifiedDate FROM list_item WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Fetch error', error: err });
    if (result.length === 0) return res.status(404).json({ message: 'List item not found' });
    res.json(result[0]);
  });
};

exports.filterListItems = (req, res) => {
  const { email = '', list_id, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const filters = [];
  const values = [];

  if (email) {
    filters.push('email LIKE ?');
    values.push(`%${email}%`);
  }

  if (list_id) {
    filters.push('list_id = ?');
    values.push(list_id);
  }

  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';
  const query = `SELECT id, list_id, email, variables, createdDate, modifiedDate FROM list_item ${where} LIMIT ? OFFSET ?`;
  const countQuery = `SELECT COUNT(*) AS total FROM list_item ${where}`;

  db.query(countQuery, values, (err, countResult) => {
    if (err) return res.status(500).json({ message: 'Count error', error: err });
    const total = countResult[0].total;

    db.query(query, [...values, +limit, +offset], (err, result) => {
      if (err) return res.status(500).json({ message: 'Fetch error', error: err });
      res.json({ total, page: +page, limit: +limit, listItems: result });
    });
  });
};
