"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFoodItem = exports.updateFoodItem = exports.getFoodItemById = exports.getFoodItems = exports.createFoodItem = void 0;
const FoodItem_1 = __importDefault(require("../models/FoodItem"));
// @desc    Create a new food item (Recipe Master)
// @route   POST /api/fooditems
// @access  Private/Admin
const createFoodItem = async (req, res) => {
    try {
        const { name, price, ingredients } = req.body;
        const foodItemExists = await FoodItem_1.default.findOne({ name });
        if (foodItemExists) {
            res.status(400).json({ message: 'Food item / Recipe already exists' });
            return;
        }
        const foodItem = await FoodItem_1.default.create({
            name,
            price,
            ingredients,
        });
        res.status(201).json(foodItem);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createFoodItem = createFoodItem;
// @desc    Get all food items (Recipes)
// @route   GET /api/fooditems
// @access  Private
const getFoodItems = async (req, res) => {
    try {
        const foodItems = await FoodItem_1.default.find().populate('ingredients.itemId', 'name category unit minStockAlert');
        res.json(foodItems);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getFoodItems = getFoodItems;
// @desc    Get food item by ID
// @route   GET /api/fooditems/:id
// @access  Private
const getFoodItemById = async (req, res) => {
    try {
        const foodItem = await FoodItem_1.default.findById(req.params.id).populate('ingredients.itemId', 'name category unit');
        if (!foodItem) {
            res.status(404).json({ message: 'Food item not found' });
            return;
        }
        res.json(foodItem);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getFoodItemById = getFoodItemById;
// @desc    Update food item (Recipe)
// @route   PUT /api/fooditems/:id
// @access  Private/Admin
const updateFoodItem = async (req, res) => {
    try {
        const { name, price, ingredients } = req.body;
        const foodItem = await FoodItem_1.default.findById(req.params.id);
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateFoodItem = updateFoodItem;
// @desc    Delete food item (Recipe)
// @route   DELETE /api/fooditems/:id
// @access  Private/Admin
const deleteFoodItem = async (req, res) => {
    try {
        const foodItem = await FoodItem_1.default.findById(req.params.id);
        if (!foodItem) {
            res.status(404).json({ message: 'Food item not found' });
            return;
        }
        await foodItem.deleteOne();
        res.json({ message: 'Food item removed' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteFoodItem = deleteFoodItem;
//# sourceMappingURL=foodItemController.js.map