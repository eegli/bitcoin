import express from 'express';
import asyncHandler from 'express-async-handler';
import { DataResponse } from '../types/response';
import { getAddressHistory } from '../services/address';
import { firstQueryParam, maybeParseInt } from '../utils';

const router = express.Router();

router.get(
  '/address/:address',
  asyncHandler(async (req, res: DataResponse) => {
    const data = await getAddressHistory({
      address: req.params.address,
      limit: maybeParseInt(firstQueryParam(req.query, 'limit')),
      offset: maybeParseInt(firstQueryParam(req.query, 'offset')),
      sort: firstQueryParam(req.query, 'sort'),
      role: firstQueryParam(req.query, 'role'),
      no_coinbase: firstQueryParam(req.query, 'no_coinbase') === 'true',
    });
    res.send({ data });
  })
);

export default router;
