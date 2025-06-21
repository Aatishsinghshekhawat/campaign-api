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