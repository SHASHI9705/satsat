import express, { Router } from 'express';
import multer from 'multer';
const upload = multer();

import { createItem } from '../controllers/itemController';
import { updateItemSoldStatus } from '../controllers/itemController';
import { fetchItems } from '../controllers/itemController';
import { uploadMiddleware } from '../controllers/itemController';
import { deleteItem } from '../controllers/itemController';
import { fetchAllItems } from '../controllers/itemController';
import { fetchItemById } from '../controllers/itemController';
import { fetchSellerById } from '../controllers/itemController';

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

// Route to fetch all items
router.get('/all', fetchAllItems);

// Route to delete an item
router.delete('/delete', deleteItem);

// Route to fetch an item by its ID
router.get('/:id', fetchItemById);

// Route to fetch seller details by their ID
router.get('/seller/:id', fetchSellerById);

export default router;