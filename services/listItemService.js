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

exports.updateListItem = ({ id, list_id, email, variables }) => {
  const modifiedDate = new Date();

  return new Promise((resolve, reject) => {
    if (!id || !list_id || !email) {
      return reject(new Error('id, list_id, and email are required'));
    }

    const checkEmailQuery = 'SELECT id FROM user WHERE email = ?';
    db.query(checkEmailQuery, [email], (err, userResult) => {
      if (err) return reject(err);
      if (userResult.length === 0) {
        return reject(new Error('Email does not exist in user table'));
      }

      const updateQuery = `
        UPDATE list_item SET list_id = ?, email = ?, variables = ?, modifiedDate = ? WHERE id = ?
      `;
      db.query(
        updateQuery,
        [list_id, email, JSON.stringify(variables || {}), modifiedDate, id],
        (err) => {
          if (err) return reject(err);
          resolve({ message: 'List item updated successfully' });
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

exports.filterListItems = ({ page = 1, limit = 10, list_id }) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;

    const baseCondition = list_id ? 'WHERE list_id = ?' : '';
    const countQuery = `SELECT COUNT(*) AS total FROM list_item ${baseCondition}`;
    const dataQuery = `
      SELECT id, list_id, email, variables, createdDate, modifiedDate
      FROM list_item
      ${baseCondition}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    const countParams = list_id ? [list_id] : [];
    const dataParams = list_id ? [list_id, parseInt(limit), parseInt(offset)] : [parseInt(limit), parseInt(offset)];

    db.query(countQuery, countParams, (err, countResult) => {
      if (err) return reject(err);
      const total = countResult[0].total;

      db.query(dataQuery, dataParams, (err, data) => {
        if (err) return reject(err);
        resolve({
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          listItems: data
        });
      });
    });
  });
};

exports.getListMetaById = (listId) => {
  const sql = `
    SELECT 
      l.id, l.name, l.createdDate,
      (SELECT COUNT(*) FROM list_item WHERE list_id = l.id) AS audienceCount
    FROM list l
    WHERE l.id = ?
  `;

  return new Promise((resolve, reject) => {
    db.query(sql, [listId], (err, result) => {
      if (err) return reject(err);
      if (result.length === 0) return reject(new Error('List not found'));
      resolve(result[0]);
    });
  });
};
