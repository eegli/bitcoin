import mysql from 'mysql2';

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string),
  user: process.env.API_DB_USER,
  password: process.env.API_DB_PASS,
  database: process.env.API_DB_NAME,
});

db.connect();

export default db;
