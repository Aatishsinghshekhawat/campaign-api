const db = require('../config/db').connection;

exports.createCampaign = ({ name, channel, status, startDate, repeat }) => {
  const now = new Date();
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO campaign (name, channel, status, startDate, repeat, createdDate, modifiedDate)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [name, channel, status, startDate, repeat ? 1 : 0, now, now], (err, result) => {
      if (err) return reject(err);
      resolve({
        id: result.insertId,
        name,
        channel,
        status,
        startDate,
        repeat,
        createdDate: now,
      });
    });
  });
};

exports.getCampaigns = ({ page = 1, limit = 10, name = '' }) => {
  const offset = (page - 1) * limit;
  const namePattern = `%${name}%`;

  const sql = `
    SELECT SQL_CALC_FOUND_ROWS id, name, channel, status, startDate, repeat, createdDate, modifiedDate
    FROM campaign
    WHERE isDeleted = 0 AND name LIKE ?
    ORDER BY createdDate DESC
    LIMIT ? OFFSET ?`;

  return new Promise((resolve, reject) => {
    db.query(sql, [namePattern, parseInt(limit), parseInt(offset)], (err, rows) => {
      if (err) return reject(err);

      db.query('SELECT FOUND_ROWS() as total', (e, countRows) => {
        if (e) return reject(e);
        resolve([rows, countRows[0].total]);
      });
    });
  });
};

exports.getCampaignById = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM campaign WHERE id = ? AND isDeleted = 0',
      [id],
      (err, rows) => {
        if (err) return reject(err);
        if (rows.length === 0) return reject(new Error('Campaign not found'));
        resolve(rows[0]);
      }
    );
  });
};

exports.updateCampaign = (id, fields = {}) => {
  const now = new Date();
  const updates = [];
  const params = [];

  if (fields.name) {
    updates.push('name = ?');
    params.push(fields.name);
  }
  if (fields.channel) {
    updates.push('channel = ?');
    params.push(fields.channel);
  }
  if (fields.status) {
    updates.push('status = ?');
    params.push(fields.status);
  }
  if (fields.startDate) {
    updates.push('startDate = ?');
    params.push(fields.startDate);
  }
  if (typeof fields.repeat !== 'undefined') {
    updates.push('repeat = ?');
    params.push(fields.repeat ? 1 : 0);
  }

  if (updates.length === 0) {
    return Promise.reject(new Error('No update fields provided'));
  }

  updates.push('modifiedDate = ?');
  params.push(now);
  params.push(id);

  const sql = `UPDATE campaign SET ${updates.join(', ')} WHERE id = ?`;

  return new Promise((resolve, reject) => {
    db.query(sql, params, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

exports.deleteCampaign = (id) => {
  const now = new Date();
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE campaign SET isDeleted = 1, modifiedDate = ? WHERE id = ? AND isDeleted = 0',
      [now, id],
      (err, result) => {
        if (err) return reject(err);
        if (result.affectedRows === 0) return reject(new Error('Campaign not found'));
        resolve();
      }
    );
  });
};

exports.copyCampaign = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM campaign WHERE id = ? AND isDeleted = 0', [id], (err, rows) => {
      if (err) return reject(err);
      if (rows.length === 0) return reject(new Error('Original campaign not found'));
      const orig = rows[0];
      const newName = orig.name + '_copy';

      const sql = `
        INSERT INTO campaign (name, channel, status, startDate, repeat, createdDate, modifiedDate)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())`;

      db.query(sql, [newName, orig.channel, orig.status, orig.startDate, orig.repeat], (insertErr, result) => {
        if (insertErr) return reject(insertErr);
        resolve({ id: result.insertId });
      });
    });
  });
};
