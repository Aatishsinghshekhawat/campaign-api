const express = require('express');
const app = express();
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { connection: db } = require('./config/db');

dotenv.config();
app.use(express.json());

const defaultRole = {
  id: 1,
  title: 'Admin',
  createdDate: new Date(),
  modifiedDate: new Date()
};

const defaultAdmin = {
  name: 'Admin',
  email: 'admin@gmail.com',
  password: 'Aaaa',
  mobileCountryCode: 91,
  mobile: 0,
  roleId: 1,
  createdDate: new Date(),
  modifiedDate: new Date()
};

db.query('SELECT id FROM role WHERE id = ?', [defaultRole.id], (err, roleResult) => {
  if (err) return console.error('MySQL SELECT role error:', err);

  if (roleResult.length === 0) {
    db.query(
      'INSERT INTO role (title, createdDate, modifiedDate) VALUES (?, ?, ?)',
      [defaultRole.title, defaultRole.createdDate, defaultRole.modifiedDate],
      (err, insertRoleResult) => {
        if (err) return console.error('MySQL INSERT role error:', err);
        console.log('Default role inserted');
        insertAdmin();
      }
    );
  } else {
    console.log('Default role already exists');
    insertAdmin(); 
  }
});

function insertAdmin() {
  bcrypt.hash(defaultAdmin.password, 10).then(hash => {

    db.query('SELECT id FROM user WHERE email = ?', [defaultAdmin.email], (err, userResult) => {
      if (err) return console.error('MySQL SELECT user error:', err);

      if (userResult.length === 0) {
        db.query(
          `INSERT INTO user (
            name, email, password, mobileCountryCode, mobile, role_id, createdDate, modifiedDate
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            defaultAdmin.name,
            defaultAdmin.email,
            hash,
            defaultAdmin.mobileCountryCode,
            defaultAdmin.mobile,
            defaultAdmin.roleId,
            defaultAdmin.createdDate,
            defaultAdmin.modifiedDate
          ],
          (err, insertUserResult) => {
            if (err) return console.error('MySQL INSERT user error:', err);
            console.log('Default admin user inserted into DB');
          }
        );
      } else {
        console.log('Admin already exists in DB');
      }
    });
  });
}

app.get('/', (req, res) => {
  res.send('API is running!');
});

app.use('/auth', authRoutes);
app.use('/user', userRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
