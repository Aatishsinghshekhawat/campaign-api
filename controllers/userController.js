const bcrypt = require('bcryptjs');
const users = require('../data/users');
const { connection: db } = require('../config/db');


exports.addUser = async (req, res) => {
  const { name, email, password, mobileCountryCode, mobile, roleId } = req.body;
  if (!name || !email || !password || !mobileCountryCode || !mobile || !roleId) {
    return res.status(400).json({ message: 'Enter all fields' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const createdDate = new Date();
  const modifiedDate = new Date();

  const sql = `
    INSERT INTO user (name, email, password, mobileCountryCode, mobile, role_id, createdDate, modifiedDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [name, email, hashedPassword, mobileCountryCode, mobile, roleId, createdDate, modifiedDate],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database insert error', error: err });
      res.status(201).json({ message: 'User added successfully', userId: result.insertId });
    }
  );
};

exports.listUsers = (req, res) => {
  const sql = `
    SELECT id, name, email, mobileCountryCode, mobile, role_id AS roleId, createdDate, modifiedDate
    FROM user
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json(results);
  });
};


exports.updateUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, password } = req.body;

  try {
    const modifiedDate = new Date();
    if (name && email && password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      return db.query(
        `UPDATE user SET name = ?, email = ?, password = ?, modifiedDate = ? WHERE id = ?`,
        [name, email, hashedPassword, modifiedDate, userId],
        (err, result) => {
          if (err) return res.status(500).json({ message: 'Database update error', error: err });
          res.json({ message: 'User updated successfully' });
        }
      );
    }

    db.query(
      'SELECT name, email, password FROM user WHERE id = ?',
      [userId],
      async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });

        const existingUser = results[0];

        const updatedName = name || existingUser.name;
        const updatedEmail = email || existingUser.email;
        const updatedPassword = password
          ? await bcrypt.hash(password, 10)
          : existingUser.password;

        db.query(
          `UPDATE user SET name = ?, email = ?, password = ?, modifiedDate = ? WHERE id = ?`,
          [updatedName, updatedEmail, updatedPassword, modifiedDate, userId],
          (err, result) => {
            if (err) return res.status(500).json({ message: 'Database update error', error: err });
            res.json({ message: 'User updated successfully' });
          }
        );
      }
    );
  } catch (error) {
  console.error('Server error in updateUser:', error);
  res.status(500).json({
    message: 'Server error',
    error: error.message || 'Unknown error'
  });
}
};


exports.getUserById = (req, res) => {
  const userId = parseInt(req.params.id);

  const sql = 'SELECT id, name, email, mobileCountryCode, mobile, role_id, createdDate, modifiedDate FROM user WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(results[0]);
  });
};
