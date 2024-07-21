import express from 'express';
import dotenv from 'dotenv';

const app = express();

dotenv.config();

const port = process.env.PORT;

app.get('/', (req, res,) => {
  res.send('Hello, TypeScript with Express!',);
},);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`,);
},);
