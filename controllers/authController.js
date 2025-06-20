exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT id, name, email, password, role_id AS roleId
    FROM user
    WHERE email = ?
  `;

  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(400).json({ message: 'Invalid email' });

    const user = results[0];

    (async () => {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '12h' });
      res.json({ token });
    })().catch(error => {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    });
  });
};

