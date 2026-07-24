import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

async function getDbConnection() {
  return mysql.createConnection(dbConfig);
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    app: 'Apexiums Super Store Admin',
    database: dbConfig.database
  });
});

app.get('/api/db-check', async (req, res) => {
  try {
    const connection = await getDbConnection();
    const [rows] = await connection.query('SELECT DATABASE() AS database_name, NOW() AS server_time');
    await connection.end();

    res.json({
      ok: true,
      database: rows[0].database_name,
      serverTime: rows[0].server_time
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
