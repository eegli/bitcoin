import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import blocksRouter from './routes/blocks';

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const port = process.env.PORT;

app.get('/version', (_, res) => {
  res.send('1.0.0');
});

app.use(blocksRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
