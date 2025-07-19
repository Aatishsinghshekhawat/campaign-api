const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { connection: db } = require('../config/db');

exports.login = (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({ message: 'Mobile and password are required' });
  }

  const query = 'SELECT * FROM user WHERE mobile = ?';
  db.query(query, [mobile], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    if (results.length === 0) {
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
