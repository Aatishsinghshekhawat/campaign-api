const bcrypt = require('bcryptjs');
const { connection: db } = require('../config/db');

exports.addUser = async (data) => {
  const { name, email, password, mobileCountryCode, mobile, roleId } = data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const createdDate = new Date();
  const modifiedDate = new Date();

  const sql = `
    INSERT INTO user (name, email, password, mobileCountryCode, mobile, role_id, createdDate, modifiedDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  return new Promise((resolve, reject) => {
    db.query(
      sql,
      [name, email, hashedPassword, mobileCountryCode, mobile, roleId, createdDate, modifiedDate],
      (err, result) => {
        if (err) return reject(err);
        resolve({ message: 'User added', userId: result.insertId });
      }
    );
  });
};

exports.listUsers = async ({ name, email, roleId, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  const filters = [];
  const values = [];

  if (name) {
    filters.push('name LIKE ?');
    values.push(`%${name}%`);
  }
  if (email) {
    filters.push('email LIKE ?');
    values.push(`%${email}%`);
  }
  if (roleId) {
    filters.push('role_id = ?');
    values.push(roleId);
  }

  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';
  const query = `SELECT id, name, email, role_id, mobile, createdDate, modifiedDate FROM user ${where} LIMIT ? OFFSET ?`;
  const countQuery = `SELECT COUNT(*) AS total FROM user ${where}`;

  return new Promise((resolve, reject) => {
    db.query(countQuery, values, (err, countResult) => {
      if (err) return reject(err);
      const total = countResult[0].total;

      db.query(query, [...values, +limit, +offset], (err, results) => {
        if (err) return reject(err);
        resolve({ users: results, total, page: +page, limit: +limit });
      });
    });
  });
};