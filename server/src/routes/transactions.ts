import express from 'express';
import asyncHandler from 'express-async-handler';
import { DataResponse } from '../types/response';
import { firstQueryParam, maybeParseInt } from '../utils';
import { getTransactions } from '../services';

const router = express.Router();

router.get(
  '/transactions',
  asyncHandler(async (req, res: DataResponse) => {
    const data = await getTransactions({
      limit: maybeParseInt(firstQueryParam(req.query, 'limit')),
      offset: maybeParseInt(firstQueryParam(req.query, 'offset')),
    });
    res.send({ data });
  })
);

export default router;
