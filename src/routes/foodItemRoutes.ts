import express from 'express';
import {
  createFoodItem,
  getFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
} from '../controllers/foodItemController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .post(protect, admin, createFoodItem)
  .get(protect, getFoodItems);

router.route('/:id')
  .get(protect, getFoodItemById)
  .put(protect, admin, updateFoodItem)
  .delete(protect, admin, deleteFoodItem);

export default router;
