const { connection: db } = require('../config/db');

exports.addListItem = (data) => {
  const { list_id, email, variables } = data;
  const createdDate = new Date();
  const modifiedDate = new Date();

  return new Promise((resolve, reject) => {
    if (!list_id || !email) {
      return reject(new Error('list_id and email are required'));
    }

    const checkEmailQuery = 'SELECT id FROM user WHERE email = ?';
    db.query(checkEmailQuery, [email], (err, userResult) => {
      if (err) return reject(err);
      if (userResult.length === 0) {
        return reject(new Error('Email does not exist in user table'));
      }

      const insertQuery = `
        INSERT INTO list_item (list_id, email, variables, createdDate, modifiedDate)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.query(
        insertQuery,
        [list_id, email, JSON.stringify(variables || {}), createdDate, modifiedDate],
        (err, result) => {
          if (err) return reject(err);
          resolve({ message: 'List item added', itemId: result.insertId });
        }
      );
    });
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