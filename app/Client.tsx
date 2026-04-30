'use server';

import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function getInitValue() {
  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 5432,
  });

  await client.connect();

  const res = await client.query('SELECT * FROM init WHERE id = $1', [1]);
  await client.end();

  return res.rows[0]; // id=1인 첫 번째 row 반환
}
