import express, { Router } from 'express';
import multer from 'multer';
const upload = multer();

import { createItem } from '../controllers/itemController';
import { updateItemSoldStatus } from '../controllers/itemController';
import { fetchItems } from '../controllers/itemController';
import { uploadMiddleware } from '../controllers/itemController';


const router: Router = express.Router();

// Debugging middleware to log incoming requests
router.use((req, res, next) => {
    next();
});

// Route to create an item with file upload middleware
router.post('/create', uploadMiddleware, createItem);

// Route to update the 'sold' status of an item
router.put('/update-sold-status', updateItemSoldStatus);

// Route to fetch all items
router.get('/fetch', fetchItems);

export default router;