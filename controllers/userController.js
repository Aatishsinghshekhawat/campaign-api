const userService = require('../services/userService');

exports.addUser = async (req, res) => {
  try {
    const result = await userService.addUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const { users, total, page, limit } = await userService.listUsers(req.query);
    res.json({ total, page, limit, users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getUserById = (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT id, name, email, role_id, mobile, createdDate, modifiedDate FROM user WHERE id = ?';

  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error fetching user', error: err });
    if (!result.length) return res.status(404).json({ message: 'User not found' });
    res.json(result[0]);
  });
};

exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const { name, email, mobileCountryCode, mobile, roleId } = req.body;
  const modifiedDate = new Date();

  const sql = `UPDATE user SET name = ?, email = ?, mobileCountryCode = ?, mobile = ?, role_id = ?, modifiedDate = ? WHERE id = ?`;

  db.query(sql, [name, email, mobileCountryCode, mobile, roleId, modifiedDate, userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Update failed', error: err });
    res.json({ message: 'User updated successfully' });
  });
};
