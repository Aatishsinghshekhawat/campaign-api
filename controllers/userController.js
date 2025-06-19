const bcrypt = require('bcryptjs');
const users = require('../data/users');

exports.addUser = async (req, res) => {
  const { name, email, password, mobileCountryCode, mobile, roleId } = req.body;

  if (!name || !email || !password || !mobileCountryCode || !mobile || !roleId) {
    return res.status(400).json({ message: 'Enter all fields' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password: hashedPassword,
    mobileCountryCode,
    mobile,
    roleId,
    createdDate: new Date(),
    modifiedDate: new Date()
  };

  users.push(newUser);
  res.json({ message: 'User added successfully', user: newUser });
};

exports.listUsers = (req, res) => {
  const usersWithoutPassword = users.map(({ password, ...rest }) => rest);
  res.json(usersWithoutPassword);
};

exports.updateUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, password } = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.name = name || user.name;
  user.email = email || user.email;
  if (password) user.password = await bcrypt.hash(password, 10);
  user.modifiedDate = new Date();

  res.json({ message: 'User updated successfully', user });
};

exports.getUserById = (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
};
