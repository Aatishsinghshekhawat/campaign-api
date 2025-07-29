const { connection: db } = require('../config/db');

/**
 * Add a new list
 */
exports.add = (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'List name is required and must be a non-empty string.' });
  }

  const now = new Date();
  const sql = `INSERT INTO list (name, createdDate, modifiedDate) VALUES (?, ?, ?)`;

  db.query(sql, [name.trim(), now, now], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database insert error', error: err.message });
    }
    res.status(201).json({ message: 'List added', listId: result.insertId });
  });
};

/**
 * Update list by ID
 */
exports.update = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'List name is required and must be a non-empty string.' });
  }

  const now = new Date();
  const sql = `UPDATE list SET name = ?, modifiedDate = ? WHERE id = ?`;

  db.query(sql, [name.trim(), now, id], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Database update error', error: err.message });
    }
    res.json({ message: 'List updated successfully' });
  });
};

/**
 * Fetch paginated lists with audience counts
 */
exports.list = (req, res) => {
  const { page = 1, limit = 10 } = req.body;

  const offset = (page - 1) * limit;
  const countSql = 'SELECT COUNT(*) AS total FROM list';
  const dataSql = `
    SELECT l.id, l.name, l.createdDate,
           (SELECT COUNT(*) FROM list_item WHERE list_id = l.id) AS audienceCount
    FROM list l
    ORDER BY l.id DESC
    LIMIT ? OFFSET ?`;

  db.query(countSql, (countErr, countResult) => {
    if (countErr) return res.status(500).json({ message: 'Count query error', error: countErr.message });
    const total = countResult[0].total;

    db.query(dataSql, [limit, offset], (dataErr, data) => {
      if (dataErr) return res.status(500).json({ message: 'Data query error', error: dataErr.message });
      res.json({ total, page, limit, lists: data });
    });
  });
};

/**
 * Get a list with all its items by list ID
 */
exports.getListWithItems = (req, res) => {
  const { id } = req.params;

  const listSql = 'SELECT id, name, createdDate FROM list WHERE id = ?';
  const itemsSql = 'SELECT id, email, variables, status, createdDate FROM list_item WHERE list_id = ? ORDER BY createdDate DESC';

  db.query(listSql, [id], (listErr, listResult) => {
    if (listErr) {
      return res.status(500).json({ message: 'Database error', error: listErr.message });
    }
    if (!listResult.length) {
      return res.status(404).json({ message: 'List not found' });
    }

    db.query(itemsSql, [id], (itemsErr, itemsResult) => {
      if (itemsErr) {
        return res.status(500).json({ message: 'Database error', error: itemsErr.message });
      }

      const list = listResult[0];

      // Parse variables JSON and build list items objects
      list.items = itemsResult.map(item => {
        let variables = {};
        try {
          variables = item.variables ? JSON.parse(item.variables) : {};
        } catch {
          variables = {};
        }

        return {
          id: item.id,
          email: item.email,
          name: variables.Name || '',
          status: item.status || 'valid',
          createdDate: item.createdDate,
        };
      });
      list.audienceCount = itemsResult.length;

      res.json(list);
    });
  });
};

/**
 * Delete a list and all its items transactionally
 */
exports.delete = (req, res) => {
  const { id } = req.params;

  db.beginTransaction(err => {
    if (err) {
      return res.status(500).json({ message: 'Transaction start error', error: err.message });
    }

    db.query('DELETE FROM list_item WHERE list_id = ?', [id], deleteErr => {
      if (deleteErr) {
        return db.rollback(() => {
          return res.status(500).json({ message: 'Error deleting list items', error: deleteErr.message });
        });
      }

      db.query('DELETE FROM list WHERE id = ?', [id], listErr => {
        if (listErr) {
          return db.rollback(() => {
            return res.status(500).json({ message: 'Error deleting list', error: listErr.message });
          });
        }

        db.commit(commitErr => {
          if (commitErr) {
            return db.rollback(() => {
              return res.status(500).json({ message: 'Error committing transaction', error: commitErr.message });
            });
          }
          res.json({ message: 'List and associated items deleted successfully' });
        });
      });
    });
  });
};
