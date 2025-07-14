const bcrypt = require('bcryptjs');
const { connection: db } = require('../config/db');

exports.addUser = async (data) => {
  const { name, email, password, mobileCountryCode, mobile } = data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const createdDate = new Date();
  const modifiedDate = new Date();
  const roleId = 1;

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
        resolve({
          message: 'User added successfully',
          user: {
            user_id: result.insertId,
            name,
            email,
            mobileCountryCode,
            mobile,
            role_id: roleId,
            createdDate,
          },
        });
      }
    );
  });
};

exports.listUsers = ({ page = 1, limit = 10, name, mobile }) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    let filters = [];
    let values = [];

    if (name && name.trim() !== '') {
      filters.push(`u.name LIKE ?`);
      values.push(`%${name}%`);
    }

    if (mobile && mobile.trim() !== '') {
      filters.push(`CONCAT(u.mobileCountryCode, u.mobile) LIKE ?`);
      values.push(`%${mobile}%`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const dataQuery = `
      SELECT 
        u.id AS user_id, u.name, u.email, u.mobileCountryCode, u.mobile, u.role_id, 
        u.createdDate, r.title AS roleTitle
      FROM user u
      LEFT JOIN role r ON u.role_id = r.id
      ${whereClause}
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM user u
      ${whereClause}
    `;

    db.query(countQuery, values, (err, countResult) => {
      if (err) return reject(err);
      const total = countResult[0].total;

      db.query(dataQuery, [...values, parseInt(limit), parseInt(offset)], (err, data) => {
        if (err) return reject(err);
        resolve({
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          users: data,
        });
      });
    });
  });
};

exports.getUserById = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id AS user_id, name, email FROM user WHERE id = ?';
    db.query(sql, [userId], (err, result) => {
      if (err) return reject(err);
      if (!result.length) return reject(new Error('User not found'));
      resolve(result[0]);
    });
  });
};

exports.deleteUser = (userId) => {
  return new Promise((resolve, reject) => {
    const checkEmailQuery = 'SELECT email FROM user WHERE id = ?';
    db.query(checkEmailQuery, [userId], (err, result) => {
      if (err) return reject(err);
      if (!result.length) return reject(new Error('User not found'));

      const userEmail = result[0].email;
      if (userEmail === 'admin@gmail.com') {
        return reject(new Error('Cannot delete admin user'));
      }

      const deleteQuery = 'DELETE FROM user WHERE id = ?';
      db.query(deleteQuery, [userId], (err, deleteResult) => {
        if (err) return reject(err);
        resolve(deleteResult);
      });
    });
  });
};
