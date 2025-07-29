const db = require('../config/db').connection;

exports.createTemplate = ({ title, status }) => {
  const now = new Date();
  const sql = `
    INSERT INTO template (title, content, status, createdDate, modifiedDate)
    VALUES (?, NULL, ?, ?, ?)
  `;
  return new Promise((res, rej) => {
    db.query(sql, [title, status, now, now], (e, outcome) => {
      if (e) return rej(e);
      res({
        id: outcome.insertId,
        title,
        content: null,
        status,
        createdDate: now,
      });
    });
  });
};

exports.getTemplates = ({ page, limit, title = '', status = '' }) => {
  const offset = (page - 1) * limit;
  const params = [];
  let sql = `SELECT SQL_CALC_FOUND_ROWS id, title, content, status, createdDate
             FROM template WHERE 1=1`;
  if (title) {
    sql += ' AND title LIKE ?';
    params.push(`%${title}%`);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  sql += ' ORDER BY createdDate DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  return new Promise((res, rej) => {
    db.query(sql, params, (e, rows) => {
      if (e) return rej(e);
      db.query('SELECT FOUND_ROWS() AS total', (err, cnt) => {
        if (err) return rej(err);
        res([rows, cnt[0].total]);
      });
    });
  });
};

exports.getTemplateById = (id) => {
  return new Promise((res, rej) => {
    db.query('SELECT * FROM template WHERE id = ?', [id], (e, rows) => {
      if (e) return rej(e);
      if (rows.length === 0) return rej(new Error('Not found'));
      res(rows[0]);
    });
  });
};

exports.updateTemplate = (id, { content }) => {
  const now = new Date();
  return new Promise((res, rej) => {
    db.query(
      'UPDATE template SET content = ?, modifiedDate = ? WHERE id = ?',
      [content, now, id],
      (e) => {
        if (e) return rej(e);
        res();
      }
    );
  });
};

exports.toggleTemplateStatus = (id) => {
  return new Promise((res, rej) => {
    db.query('SELECT status FROM template WHERE id = ?', [id], (e, rows) => {
      if (e) return rej(e);
      const next = rows[0].status === 'enabled' ? 'disabled' : 'enabled';
      db.query(
        'UPDATE template SET status = ?, modifiedDate = ? WHERE id = ?',
        [next, new Date(), id],
        (err) => {
          if (err) return rej(err);
          res({ id, status: next });
        }
      );
    });
  });
};
