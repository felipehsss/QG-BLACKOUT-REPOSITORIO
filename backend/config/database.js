import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // Carrega as variáveis do .env


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


async function getConnection() {
  return await pool.getConnection();
}

async function readAll(table, where = null) {
  const connection = await getConnection();
  try {
    let sql = `SELECT * FROM ${table}`;
    if (where) sql += ` WHERE ${where}`;
    const [rows] = await connection.execute(sql);
    return rows;
  } finally {
    connection.release();
  }
}

async function read(table, where) {
  const connection = await getConnection();
  try {
    let sql = `SELECT * FROM ${table}`;
    if (where) sql += ` WHERE ${where}`;
    const [rows] = await connection.execute(sql);
    return rows[0] || null;
  } finally {
    connection.release();
  }
}

async function create(table, data) {
  const connection = await getConnection();
  try {
    const columns = Object.keys(data).join(", ");
    const placeholders = Array(Object.keys(data).length).fill("?").join(", ");
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    const values = Object.values(data);
    const [result] = await connection.execute(sql, values);
    return result.insertId;
  } finally {
    connection.release();
  }
}

async function update(table, data, where) {
  const connection = await getConnection();
  try {
    const set = Object.keys(data)
      .map(column => `${column} = ?`)
      .join(", ");
    const sql = `UPDATE ${table} SET ${set} WHERE ${where}`;
    const values = Object.values(data);
    const [result] = await connection.execute(sql, values);
    return result.affectedRows;
  } finally {
    connection.release();
  }
}

async function deleteRecord(table, where) {
  const connection = await getConnection();
  try {
    const sql = `DELETE FROM ${table} WHERE ${where}`;
    const [result] = await connection.execute(sql);
    return result.affectedRows;
  } finally {
    connection.release();
  }
}

export { create, readAll, read, update, deleteRecord, getConnection };

