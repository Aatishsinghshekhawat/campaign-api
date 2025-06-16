const express = require('express');
const bcrypt = require('bcryptjs');
const users = require('../data/users');

const router = express.Router();

router.get('/list', (req, res) => {
    res.json(users);
});

router.post('/add', async (req, res) => {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), name, email, password: hashed };
    users.push(newUser);
    res.json(newUser);
});

router.put('/add/:id', (req, res) => {
    const { id } = req.params;
    const index = users.findIndex(u => u.id == id);
    if (index === -1) return res.status(404).json({ msg: 'User not found' });

    users[index] = { ...users[index], ...req.body };
    res.json(users[index]);
});

router.get('/:id', (req, res) => {
    const user = users.find(u => u.id == req.params.id);
    if (!user) return res.status(404).json({ msg: 'Not found' });
    res.json(user);
});

module.exports = router;
