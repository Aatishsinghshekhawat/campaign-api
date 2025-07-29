const { connection: db } = require('../config/db');

exports.list = ({ page = 1, limit = 10 }) => 
  new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    const countSql = 'SELECT COUNT(*) AS total FROM list';
    const dataSql = `
      SELECT l.id, l.name, l.createdDate,
             (SELECT COUNT(*) FROM list_item WHERE list_id = l.id) AS audienceCount
      FROM list l
      ORDER BY l.id DESC
      LIMIT ? OFFSET ?`;

    db.query(countSql, (err, countResult) => {
      if (err) return reject(err);
      const total = countResult[0].total;

      db.query(dataSql, [limit, offset], (err, data) => {
        if (err) return reject(err);
        resolve({ total, page, limit, lists: data });
      });
    });
  });

exports.getListWithItems = (id) =>
  new Promise((resolve, reject) => {
    const listSql = 'SELECT id, name, createdDate FROM list WHERE id = ?';
    const itemsSql = 'SELECT id, email, variables, status, createdDate FROM list_item WHERE list_id = ? ORDER BY createdDate DESC';

    db.query(listSql, [id], (err, listResults) => {
      if (err) return reject(err);
      if (!listResults.length) return reject(new Error('List not found'));

      db.query(itemsSql, [id], (err, itemsResults) => {
        if (err) return reject(err);

        const list = listResults[0];
        list.items = itemsResults.map(item => {
          let variables = {};
          try {
            variables = item.variables ? JSON.parse(item.variables) : {};
          } catch {
            variables = {};
          }
          return {
            id: item.id,
            email: item.email,
            name: variables.Name || '',
            status: item.status || 'valid',
            createdDate: item.createdDate,
          };
        });

        list.audienceCount = itemsResults.length;

        resolve(list);
      });
    });
  });

exports.delete = (id) => 
  new Promise((resolve, reject) => {
    db.beginTransaction(err => {
      if (err) return reject(err);
      db.query('DELETE FROM list_item WHERE list_id = ?', [id], err => {
        if (err) return db.rollback(() => reject(err));
        db.query('DELETE FROM list WHERE id = ?', [id], err => {
          if (err) return db.rollback(() => reject(err));
          db.commit(err => err ? db.rollback(() => reject(err)) : resolve());
        });
      });
    });
  });
