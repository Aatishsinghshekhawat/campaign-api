const express = require('express');
const app = express();
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const users = require('./data/users');

dotenv.config();
app.use(express.json());

const defaultAdmin = {
  id: 1,
  name: 'Admin',
  email: 'admin@gmail.com',
  password: 'Aaaa',
  mobileCountryCode: 91,
  mobile: 9999999999,
  roleId: 1,
  createdDate: new Date(),
  modifiedDate: new Date()
};

bcrypt.hash('admin123', 10).then(hash => {
  defaultAdmin.password = hash;
  users.push(defaultAdmin);
  console.log('Default admin user added');
});

app.get('/', (req, res) => {
  res.send('API is running!');
});

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
