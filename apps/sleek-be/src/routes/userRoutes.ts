import express, { Router } from 'express';
import { createUser, googleSignup } from '../controllers/userController';

const router: Router = express.Router();

// Route to create a user manually
router.post('/create', createUser);

// Route for Google signup
router.post('/google-signup', googleSignup);

export default router;