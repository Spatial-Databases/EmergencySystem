
import { Router, } from 'express';

const router = Router();

router.get('/', (req, res,) => {
  res.send('Hello, TypeScript with Express!',);
},);

export default router;
