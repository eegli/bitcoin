import express from 'express';
import asyncHandler from 'express-async-handler';
import { DataResponse } from '../types/response';
import { firstQueryParam, maybeParseInt } from '../utils';
import { getBlocks } from '../services';

const router = express.Router();

router.get(
  '/blocks',
  asyncHandler(async (req, res: DataResponse) => {
    const data = await getBlocks({
      limit: maybeParseInt(firstQueryParam(req.query, 'limit')),
      offset: maybeParseInt(firstQueryParam(req.query, 'offset')),
      sort: firstQueryParam(req.query, 'sort'),
    });
    res.send({ data });
  })
);

router.get(
  '/blocks/latest',
  asyncHandler(async (req, res: DataResponse) => {
    const data = await getBlocks({
      limit: 1,
      offset: 0,
      sort: 'desc',
    });
    res.send({ data: data[0] });
  })
);

export default router;
