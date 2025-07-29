const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connection: db } = require('../config/db');

exports.loginUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, name, email, password, role_id AS roleId FROM user WHERE email = ?';

    db.query(sql, [email], async (err, results) => {
      if (err) return reject(new Error('Database error'));
      if (!results.length) return reject(new Error('Invalid email'));

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return reject(new Error('Invalid password'));

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      resolve(token);
    });
  });
};

exports.listLists = ({ page = 1, limit = 10 }) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;

    const dataQuery = `
      SELECT id, name, createdDate, modifiedDate
      FROM list
      ORDER BY createdDate DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `SELECT COUNT(*) AS total FROM list`;

    db.query(dataQuery, [parseInt(limit), parseInt(offset)], (err, results) => {
      if (err) return reject(err);

      db.query(countQuery, (countErr, countResults) => {
        if (countErr) return reject(countErr);

        const total = countResults[0]?.total || 0;
        resolve({ data: results, total });
      });
    });
  });
};