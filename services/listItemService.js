const { connection: db } = require('../config/db');

exports.addListItem = (data) => {
  const { list_id, email, variables } = data;
  const createdDate = new Date();
  const modifiedDate = new Date();

  const sql = `
    INSERT INTO list_item (list_id, email, variables, createdDate, modifiedDate)
    VALUES (?, ?, ?, ?, ?)
  `;

  return new Promise((resolve, reject) => {
    db.query(
      sql,
      [list_id, email, JSON.stringify(variables), createdDate, modifiedDate],
      (err, result) => {
        if (err) return reject(err);
        resolve({ message: 'List item added', itemId: result.insertId });
      }
    );
  });
};

exports.updateListItem = ({ id, list_id, email, variables }) => {
  const modifiedDate = new Date();
  const sql = `
    UPDATE list_item
    SET list_id = ?, email = ?, variables = ?, modifiedDate = ?
    WHERE id = ?
  `;

  return new Promise((resolve, reject) => {
    db.query(
      sql,
      [list_id, email, JSON.stringify(variables), modifiedDate, id],
      (err) => {
        if (err) return reject(err);
        resolve({ message: 'List item updated successfully' });
      }
    );
  });
};

exports.getListItemById = (id) => {
  const sql = `
    SELECT id, list_id, email, variables, createdDate, modifiedDate
    FROM list_item
    WHERE id = ?
  `;

  return new Promise((resolve, reject) => {
    db.query(sql, [id], (err, result) => {
      if (err) return reject(err);
      if (result.length === 0) return reject(new Error('List item not found'));
      resolve(result[0]);
    });
  });
};

exports.filterListItems = ({ email = '', list_id, page = 1, limit = 10 }) => {
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
  const query = `
    SELECT id, list_id, email, variables, createdDate, modifiedDate
    FROM list_item
    ${where}
    LIMIT ? OFFSET ?
  `;
  const countQuery = `SELECT COUNT(*) AS total FROM list_item ${where}`;

  return new Promise((resolve, reject) => {
    db.query(countQuery, values, (err, countResult) => {
      if (err) return reject(err);
      const total = countResult[0].total;

      db.query(query, [...values, +limit, +offset], (err, result) => {
        if (err) return reject(err);
        resolve({ total, page: +page, limit: +limit, listItems: result });
      });
    });
  });
};
