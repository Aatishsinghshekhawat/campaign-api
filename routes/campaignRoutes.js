const express = require("express");
const router = express.Router();
const { connection: db } = require('../config/db');

router.get("/list", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const name = req.query.name || "";

  const offset = (page - 1) * limit;

  const countQuery = "SELECT COUNT(*) AS total FROM campaigns WHERE name LIKE ? AND isDeleted = 0;";
  const listQuery = `
    SELECT id, name, status, startDate, repeat, createdAt, modifiedAt
    FROM campaigns
    WHERE name LIKE ? AND isDeleted = 0
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?;`;

  const likeName = `%${name}%`;

  db.query(countQuery, [likeName], (countErr, countResults) => {
    if (countErr) {
      console.error(countErr);
      return res.status(500).json({ error: "Database error counting campaigns" });
    }
    const total = countResults[0].total;

    db.query(listQuery, [likeName, limit, offset], (listErr, rows) => {
      if (listErr) {
        console.error(listErr);
        return res.status(500).json({ error: "Database error fetching campaigns" });
      }
      res.json({ total, campaigns: rows });
    });
  });
});

router.post("/copy/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT * FROM campaigns WHERE id = ? AND isDeleted = 0",
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "DB error fetching campaign" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      const original = results[0];

      const newName = original.name + "_copy_1";
      const insertQuery = `INSERT INTO campaigns 
        (name, status, startDate, repeat, createdAt, modifiedAt, isDeleted) 
        VALUES (?, ?, ?, ?, NOW(), NOW(), 0)`;

      db.query(
        insertQuery,
        [newName, original.status, original.startDate, original.repeat],
        (insertErr, insertResult) => {
          if (insertErr) {
            console.error(insertErr);
            return res.status(500).json({ error: "DB error creating copy" });
          }
          res.json({ message: "Campaign copied successfully", id: insertResult.insertId });
        }
      );
    }
  );
});

router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "UPDATE campaigns SET isDeleted = 1, modifiedAt = NOW() WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "DB error deleting campaign" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json({ message: "Campaign deleted successfully" });
    }
  );
});

module.exports = router;
