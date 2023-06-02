// path.js

const host = import.meta.env.VITE_APP_API_HOST || 'localhost';
const port = import.meta.env.VITE_APP_API_PORT || '8000';

const base = {
  block_test: '../public/block.json',
  transactions: '../public/blocks/',
  address: '../public/address/',

  server_block: `http://localhost:8000/blocks`,
  server_height: `http://localhost:8000/blocks/`,
  server_address: `http://localhost:8000/address/`,
};

export default base;
