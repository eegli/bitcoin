import dotenv from 'dotenv';

dotenv.config({ path: '../.env', override: false });

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import blocksRouter from './routes/blocks';
import addressRouter from './routes/address';

const app = express();
const port = process.env.API_PORT;

app.use(morgan('common'));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use((_, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=86400');
  next();
});
app.use(cors());

app.get('/version', (_, res) => {
  res.send('1.0.0');
});

app.use(blocksRouter);
app.use(addressRouter);

app.get('*', (_, res) => {
  res.status(404).send({
    error: {
      message: 'Not Found',
      status: 404,
    },
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
