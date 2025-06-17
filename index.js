const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();
app.use(express.json());

let users = [];

bcrypt.hash("admin123", 10).then(hashedPassword => {
  users.push({
    id: 1,
    name: "Admin",
    email: "admin@gmail.com",
    password: hashedPassword
  });
  console.log("Default admin user added");
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token required' });

  jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'Invalid inputs' });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).json({ message: 'Invalid inputs' });

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
  res.json({ token });
});

app.post('/user/add', authenticateToken, async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password: hashedPassword
  };
  users.push(newUser);
  res.json({ message: 'User added successfully', user: newUser });
});

app.get('/user/list', authenticateToken, (req, res) => {
  const usersWithoutPassword = users.map(({ password, ...rest }) => rest);
  res.json(usersWithoutPassword);
});

app.put('/user/add/:id', authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, password } = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.name = name || user.name;
  user.email = email || user.email;
  if (password) user.password = await bcrypt.hash(password, 10);

  res.json({ message: 'User updated successfully', user });
});

app.get('/user/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
