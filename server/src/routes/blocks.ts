import express from 'express';
import asyncHandler from 'express-async-handler';
import { DataResponse } from '../types/response';
import { firstQueryParam, maybeParseInt } from '../utils';
import { getBlock, getBlocks } from '../services';

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
    res.send({ data: data });
  })
);

router.get(
  '/blocks/:height',
  asyncHandler(async (req, res: DataResponse) => {
    const height = parseInt(req.params.height);
    if (isNaN(height)) {
      res.send({ data: [] });
      return;
    }
    const data = await getBlock({
      height,
    });
    // No block found
    if (data.length === 0) {
      res.send({ data: [] });
      return;
    }
    res.send({ data });
  })
);

export default router;
