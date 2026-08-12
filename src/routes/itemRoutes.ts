import express from 'express';
import { getItems, getItemById, createItem, updateItem, deleteItem } from '../controllers/itemController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getItems)
  .post(protect, admin, createItem);

router.route('/:id')
  .get(protect, getItemById)
  .put(protect, admin, updateItem)
  .delete(protect, admin, deleteItem);

export default router;
