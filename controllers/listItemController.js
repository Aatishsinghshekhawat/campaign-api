const listItemService = require('../services/listItemService');
const streamifier = require('streamifier');
const csv = require('csv-parser');
const { connection: db } = require('../config/db');

exports.addListItem = async (req, res) => {
  try {
    const result = await listItemService.addListItem(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Insert error', error: error.message });
  }
};

exports.updateListItem = async (req, res) => {
  try {
    const result = await listItemService.updateListItem({ id: req.params.id, ...req.body });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Update error', error: error.message });
  }
};

exports.getListItemById = async (req, res) => {
  try {
    const result = await listItemService.getListItemById(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.filterListItems = async (req, res) => {
  try {
    const result = await listItemService.filterListItems(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Fetch error', error: error.message });
  }
};

exports.uploadCSV = (req, res) => {
  const results = [];
  const createdDate = new Date();
  const modifiedDate = new Date();

  if (!req.file) {
    return res.status(400).json({ message: 'CSV file is required' });
  }

  streamifier
    .createReadStream(req.file.buffer)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      if (!results.length) return res.status(400).json({ message: 'CSV is empty' });

      const values = results.map(row => [
        row.list_id,
        row.email,
        JSON.stringify(JSON.parse(row.variables || '{}')),
        createdDate,
        modifiedDate
      ]);

      const sql = `INSERT INTO list_item (list_id, email, variables, createdDate, modifiedDate) VALUES ?`;

      db.query(sql, [values], (err, result) => {
        if (err) {
          console.error('Insert error:', err);
          return res.status(500).json({ message: 'Database insert error', error: err });
        }
        res.status(201).json({ message: 'CSV data inserted', rowsInserted: result.affectedRows });
      });
    })
    .on('error', (error) => {
      res.status(500).json({ message: 'CSV parsing error', error });
    });
};
