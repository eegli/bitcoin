import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import db, { getBlock, getBlockCount, getBlocks } from './db';
import asyncHandler from 'express-async-handler';
import { DataResponse } from './types/response';
import { firstQueryParam, maybeParseInt } from './utils';

const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const port = process.env.PORT;

app.get('/version', (req, res) => {
  res.send('1.0.0');
});

app.get(
  '/info',
  asyncHandler(async (req, res) => {
    const count = await getBlockCount(db);
    res.send({ data: count });
  })
);
app.get(
  '/blocks',
  asyncHandler(async (req, res: DataResponse) => {
    const data = await getBlocks({
      db,
      limit: maybeParseInt(firstQueryParam(req.query, 'limit')),
      offset: maybeParseInt(firstQueryParam(req.query, 'offset')),
      sort: firstQueryParam(req.query, 'sort'),
    });
    res.send({ data });
  })
);
app.get(
  '/blocks/latest',
  asyncHandler(async (req, res: DataResponse) => {
    const data = await getBlocks({
      db,
      limit: 1,
      offset: 0,
      sort: 'desc',
    });
    res.send({ data: data[0] });
  })
);
app.get(
  '/blocks/:hash',
  asyncHandler(async (req, res: DataResponse) => {
    const data = await getBlock({
      db,
      hash: req.params.hash,
    });
    res.send({ data });
  })
);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.on;
