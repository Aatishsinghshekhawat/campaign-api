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

exports.listUsers = ({ page = 1, limit = 10, name, mobile }) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;

    let filters = [];
    let values = [];

    // Filter by name only if it's not empty or whitespace
    if (name && name.trim() !== '') {
      filters.push(`u.name LIKE ?`);
      values.push(`%${name}%`);
    }

    // Filter by mobile (combined country code + mobile) only if not empty
    if (mobile && mobile.trim() !== '') {
      filters.push(`CONCAT(u.mobileCountryCode, u.mobile) LIKE ?`);
      values.push(`%${mobile}%`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const dataQuery = `
      SELECT u.id, u.name, u.email, u.mobileCountryCode, u.mobile, u.role_id, r.title AS roleTitle
      FROM user u
      JOIN role r ON u.role_id = r.id
      ${whereClause}
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM user u
      ${whereClause}
    `;

    // Get total count first
    db.query(countQuery, values, (err, countResult) => {
      if (err) return reject(err);
      const total = countResult[0].total;

      // Now get paginated user data
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
