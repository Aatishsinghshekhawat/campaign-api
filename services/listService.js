const { connection: db } = require('../config/db');

exports.listLists = ({ page = 1, limit = 10 }) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*) AS total FROM list`;

    const dataQuery = `
      SELECT l.id, l.name, l.createdDate, COUNT(li.id) AS audienceCount
      FROM list l
      LEFT JOIN list_item li ON l.id = li.list_id
      GROUP BY l.id
      ORDER BY l.id DESC
      LIMIT ? OFFSET ?
    `;

    db.query(countQuery, (err, countResult) => {
      if (err) return reject(err);
      const total = countResult[0].total;

      db.query(dataQuery, [parseInt(limit), parseInt(offset)], (err, data) => {
        if (err) return reject(err);
        resolve({
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          lists: data
        });
      });
    });
  });
};
