const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { connection: db } = require('../config/db');

exports.login = (req, res) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) {
    return res.status(400).json({ message: 'Mobile and password are required' });
  }
  db.query('SELECT * FROM user WHERE mobile = ?', [mobile], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!results.length) {
      return res.status(401).json({ message: 'Invalid mobile or password' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid mobile or password' });

    const token = jwt.sign({ id: user.id, role: user.role_id }, process.env.JWT_SECRET, {
      expiresIn: '15d'
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, roleId: user.role_id } });
  });
};

exports.signup = async (req, res) => {
  const { name, email, password, mobileCountryCode, mobile } = req.body;
  if (!name || !email || !password || !mobileCountryCode || !mobile) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdDate = new Date();
    const modifiedDate = new Date();
    const roleId = 2; // normal user
    db.query(
      `INSERT INTO user (name, email, password, mobileCountryCode, mobile, role_id, createdDate, modifiedDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, mobileCountryCode, mobile, roleId, createdDate, modifiedDate],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'User already exists' });
          }
          return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verify = (req, res) => {
  res.json({ message: 'Token valid' });
};
