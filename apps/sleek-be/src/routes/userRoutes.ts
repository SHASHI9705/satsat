import express, { Router } from 'express';
import { createUser } from '../controllers/userController';
import { getUserDetails } from '../controllers/userController';
import { updateUserDetails } from '../controllers/userController';
import { deleteUserAccount } from '../controllers/userController';

const router: Router = express.Router();

router.post('/create', createUser);
router.get('/details', getUserDetails);
router.put('/update', updateUserDetails);
router.delete('/delete', deleteUserAccount);

export default router;