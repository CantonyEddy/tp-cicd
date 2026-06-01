const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'tp',
  port: 5432,
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Hello from tp-cicd !' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time');
    res.json({ db: 'connected', time: result.rows[0].time });
  } catch (err) {
    res.status(500).json({ db: 'error', error: err.message });
  }
});

app.listen(port, () => console.log(`App running on port ${port}`));