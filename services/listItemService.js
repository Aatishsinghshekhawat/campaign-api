const { connection: db } = require('../config/db');

exports.add = (data) => {
  const { list_id, email, variables } = data;
  const now = new Date();

  return new Promise((resolve, reject) => {
    if (!list_id || !email) {
      return reject(new Error('list_id and email are required'));
    }

    const checkUserSql = 'SELECT id FROM user WHERE email = ?';
    db.query(checkUserSql, [email], (err, userResult) => {
      if (err) return reject(err);
      if (!userResult.length) return reject(new Error('Email does not exist in user table'));

      const insertSql = `
        INSERT INTO list_item (list_id, email, variables, status, createdDate, modifiedDate) 
        VALUES (?, ?, ?, 'valid', ?, ?)`;

      const nowTime = new Date();

      db.query(insertSql, [list_id, email, JSON.stringify(variables || {}), nowTime, nowTime], (err, result) => {
        if (err) return reject(err);
        resolve({ message: 'List item added', itemId: result.insertId });
      });
    });
  });
};

exports.update = ({ id, list_id, email, variables }) => {
  const now = new Date();

  return new Promise((resolve, reject) => {
    if (!id || !list_id || !email) {
      return reject(new Error('id, list_id, and email are required'));
    }

    const checkUserSql = 'SELECT id FROM user WHERE email = ?';
    db.query(checkUserSql, [email], (err, userResult) => {
      if (err) return reject(err);
      if (!userResult.length) return reject(new Error('Email does not exist in user table'));

      const updateSql = `
        UPDATE list_item SET list_id = ?, email = ?, variables = ?, status = 'valid', modifiedDate = ? 
        WHERE id = ?`;

      db.query(updateSql, [list_id, email, JSON.stringify(variables || {}), now, id], (err) => {
        if (err) return reject(err);
        resolve({ message: 'List item updated successfully' });
      });
    });
  });
};

exports.getById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id, email, list_id, variables, status, createdDate FROM list_item WHERE id = ?`;
    db.query(sql, [id], (err, results) => {
      if (err) return reject(err);
      if (!results.length) return reject(new Error('Item not found'));
      resolve(results[0]);
    });
  });
};

exports.filter = ({ page = 1, limit = 10, list_id }) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    const whereClause = list_id ? 'WHERE list_id = ?' : '';
    const countSql = `SELECT COUNT(*) AS total FROM list_item ${whereClause}`;
    const dataSql = `
      SELECT id, email, variables, status, createdDate 
      FROM list_item
      ${whereClause}
      ORDER BY createdDate DESC
      LIMIT ? OFFSET ?`;

    const countParams = list_id ? [list_id] : [];
    const dataParams = list_id ? [list_id, limit, offset] : [limit, offset];

    db.query(countSql, countParams, (err, countResult) => {
      if (err) return reject(err);
      const total = countResult[0].total;

      db.query(dataSql, dataParams, (err, data) => {
        if (err) return reject(err);

        const items = data.map(item => {
          let variables = {};
          try {
            variables = JSON.parse(item.variables);
          } catch {
            variables = {};
          }
          return {
            id: item.id,
            email: item.email,
            name: variables.Name || '',
            status: item.status,
            createdDate: item.createdDate,
          };
        });

        resolve({
          total,
          page,
          limit,
          items,
        });
      });
    });
  });
};

exports.getMeta = (listId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT l.id, l.name, l.createdDate,
      (SELECT COUNT(*) FROM list_item WHERE list_id = l.id) AS audienceCount
      FROM list l
      WHERE l.id = ?`;

    db.query(sql, [listId], (err, results) => {
      if (err) return reject(err);
      if (!results.length) return reject(new Error('List not found'));
      resolve(results[0]);
    });
  });
};

exports.processCsvUpload = (listId, rows) => {
  return new Promise((resolve, reject) => {
    if (!listId) return reject(new Error('Missing listId'));
    if (!rows || !Array.isArray(rows) || rows.length === 0) return reject(new Error('No rows to process'));

    const VALID_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
    const emailsSet = new Set();

    db.beginTransaction(async (err) => {
      if (err) return reject(err);

      try {
        let insertedCount = 0;

        for (const row of rows) {
          const email = (row.Email || '').trim();
          if (!email || !VALID_EMAIL_REGEX.test(email)) continue;

          const lowerEmail = email.toLowerCase();

          if (emailsSet.has(lowerEmail)) continue;
          emailsSet.add(lowerEmail);

          // Check if email exists for list
          const exists = await new Promise((res, rej) => {
            db.query(
              'SELECT id FROM list_item WHERE list_id = ? AND email = ?',
              [listId, email],
              (error, results) => {
                if (error) return rej(error);
                res(results.length > 0);
              }
            );
          });

          if (exists) continue;

          const variables = {...row};
          delete variables.Email;

          await new Promise((res, rej) => {
            db.query(
              'INSERT INTO list_item (list_id, email, variables, status, createdDate, modifiedDate) VALUES (?, ?, ?, ?, NOW(), NOW())',
              [listId, email, JSON.stringify(variables), 'valid'],
              (error) => {
                if (error) return rej(error);
                insertedCount++;
                res();
              }
            );
          });
        }

        db.commit((commitErr) => {
          if (commitErr) return db.rollback(() => reject(commitErr));
          resolve({ message: 'CSV uploaded successfully', inserted: insertedCount });
        });
      } catch (error) {
        db.rollback(() => reject(error));
      }
    });
  });
};

exports.delete = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM list_item WHERE id = ?', [id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};
