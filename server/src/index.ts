import dotenv from 'dotenv';

dotenv.config({ path: '../.env', override: false });

import express from 'express';
import morgan from 'morgan';
import blocksRouter from './routes/blocks';
import addressRouter from './routes/address';

const app = express();

app.use(morgan('common'));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const port = process.env.API_PORT;

app.get('/version', (_, res) => {
  res.send('1.0.0');
});

app.use(blocksRouter);
app.use(addressRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
