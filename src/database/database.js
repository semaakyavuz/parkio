const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// SQLite Bağlantısı
const db = new sqlite3.Database('favorites.db', (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Tablo Oluştur
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    name TEXT,
    image TEXT,
    description TEXT,
    facilities TEXT,
    note TEXT
  )
`;

db.run(createTableQuery, (err) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Favorites table created or already exists.');
  }
});

// Favorileri getirirken not sütunu dahil ediliyor
app.get('/favorites', (req, res) => {
  db.all('SELECT * FROM favorites', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const processedRows = rows.map(row => ({
        ...row,
        facilities: row.facilities ? row.facilities.split(',') : [],
      }));
      res.json(processedRows);
    }
  });
});

// Yeni Favori Ekle
app.post('/favorites', (req, res) => {
  const { id, name, image, description, facilities, note } = req.body;
  const facilitiesAsString = Array.isArray(facilities) ? facilities.join(',') : facilities;

  db.run(
    'INSERT INTO favorites (id, name, image, description, facilities, note) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, image, description, facilitiesAsString, note],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id, name, image, description, facilities, note });
      }
    }
  );
});


app.delete('/favorites/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM favorites WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Favori silindi.' });
    }
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
