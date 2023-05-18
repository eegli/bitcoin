import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import db from './db';

import asyncHandler from 'express-async-handler';
import { RowDataPacket } from 'mysql2';

const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const port = process.env.PORT;

app.get(
  '/',
  asyncHandler(async (req, res) => {
    const [row] = await db
      .promise()
      .execute<RowDataPacket[]>('select count(*) from blocks');
    res.send({ data: row[0]['count(*)'] });
  })
);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.on;
