import { Router, Request, Response, } from 'express';
import userService from '../services/UserService.js';
import { sendResponse, sendError, } from '../middleware/responseHandler.js';

const router = Router();

router.get('/', async (req: Request, res: Response,) => {
  try {
    const users = await userService.getAllUsers();
    sendResponse(res, 200, users, 'Users retrieved successfully',);
  } catch (error) {
    sendError(res, { message: error as string, },);
  }
},);

router.get('/special', async (req: Request, res: Response,) => {
  try {
    const users = await userService.getAllUsersSpecial();
    sendResponse(res, 200, users, 'Users retrieved successfully',);
  } catch (error) {
    sendError(res, { message: error as string, },);
  }
},);

router.post('/', async (req: Request, res: Response,) => {
  const { name, email, } = req.body;
  try {
    const user = await userService.createUser(name, email,);
    sendResponse(res, 201, user, 'User created successfully',);
  } catch (error) {
    sendError(res, { message: error as string, },);
  }
},);

export default router;
