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

exports.getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await userService.getUserById(userId);
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: 'User not found', error: error.message });
  }
};

exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const { name, email, mobileCountryCode, mobile, roleId } = req.body;
  const modifiedDate = new Date();

  const sql = `UPDATE user SET name = ?, email = ?, mobileCountryCode = ?, mobile = ?, role_id = ?, modifiedDate = ? WHERE id = ?`;

  const { connection: db } = require('../config/db');
  db.query(
    sql,
    [name, email, mobileCountryCode, mobile, roleId, modifiedDate, userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Update failed', error: err });
      res.json({ message: 'User updated successfully' });
    }
  );
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await userService.getUserById(userId);
    if (user.email === 'admin@gmail.com') {
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }

    await userService.deleteUser(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed', error: error.message });
  }
};
