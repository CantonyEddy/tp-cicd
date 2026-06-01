const express = require('express');
const { Pool } = require('pg');
const client = require('prom-client');

const app = express();
const port = 3000;

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'tp',
  port: 5432,
});

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });
  next();
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

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(port, () => console.log(`App running on port ${port}`));