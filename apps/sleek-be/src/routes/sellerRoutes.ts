import express, { Router } from 'express';
import { fetchSellerById } from '../controllers/itemController';

const router: Router = express.Router();

// Route to fetch seller details by their ID
router.get('/:id', fetchSellerById);

export default router;