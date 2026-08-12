import { Request, Response } from 'express';
import FoodItem from '../models/FoodItem';

// @desc    Create a new food item (Recipe Master)
// @route   POST /api/fooditems
// @access  Private/Admin
export const createFoodItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price, ingredients } = req.body;

    const foodItemExists = await FoodItem.findOne({ name });

    if (foodItemExists) {
      res.status(400).json({ message: 'Food item / Recipe already exists' });
      return;
    }

    const foodItem = await FoodItem.create({
      name,
      price,
      ingredients,
    });

    res.status(201).json(foodItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Get all food items (Recipes)
// @route   GET /api/fooditems
// @access  Private
export const getFoodItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const foodItems = await FoodItem.find().populate('ingredients.itemId', 'name category unit minStockAlert');
    res.json(foodItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Get food item by ID
// @route   GET /api/fooditems/:id
// @access  Private
export const getFoodItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const foodItem = await FoodItem.findById(req.params.id).populate('ingredients.itemId', 'name category unit');
    if (!foodItem) {
      res.status(404).json({ message: 'Food item not found' });
      return;
    }
    res.json(foodItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Update food item (Recipe)
// @route   PUT /api/fooditems/:id
// @access  Private/Admin
export const updateFoodItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price, ingredients } = req.body;
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      res.status(404).json({ message: 'Food item not found' });
      return;
    }

    foodItem.name = name || foodItem.name;
    foodItem.price = price !== undefined ? price : foodItem.price;
    if (ingredients) {
      foodItem.ingredients = ingredients;
    }

    const updated = await foodItem.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Delete food item (Recipe)
// @route   DELETE /api/fooditems/:id
// @access  Private/Admin
export const deleteFoodItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    if (!foodItem) {
      res.status(404).json({ message: 'Food item not found' });
      return;
    }

    await foodItem.deleteOne();
    res.json({ message: 'Food item removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
