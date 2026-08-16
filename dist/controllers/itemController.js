"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.updateItem = exports.createItem = exports.getItemById = exports.getItems = void 0;
const Item_1 = __importDefault(require("../models/Item"));
// @desc    Get all items (with optional category filter)
// @route   GET /api/items
// @access  Private
const getItems = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category: String(category) } : {};
        const items = await Item_1.default.find(filter).sort({ category: 1, name: 1 });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.getItems = getItems;
// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Private
const getItemById = async (req, res) => {
    try {
        const item = await Item_1.default.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.getItemById = getItemById;
// @desc    Create an item
// @route   POST /api/items
// @access  Private/Admin
const createItem = async (req, res) => {
    const { name, category, unit, minStockAlert, minCartStockAlert, minInventoryStockAlert, startingQuantity, currentQuantity } = req.body;
    try {
        const itemExists = await Item_1.default.findOne({ name });
        if (itemExists) {
            res.status(400).json({ message: 'Item already exists' });
            return;
        }
        const item = await Item_1.default.create({
            name,
            category: category || 'Ingredient',
            unit: unit || 'kg',
            minStockAlert: minStockAlert !== undefined ? Number(minStockAlert) : 0,
            minCartStockAlert: minCartStockAlert !== undefined ? Number(minCartStockAlert) : (minStockAlert !== undefined ? Number(minStockAlert) : 0),
            minInventoryStockAlert: minInventoryStockAlert !== undefined ? Number(minInventoryStockAlert) : (minStockAlert !== undefined ? Number(minStockAlert) : 0),
            startingQuantity: startingQuantity !== undefined ? Number(startingQuantity) : 0,
            currentQuantity: currentQuantity !== undefined ? Number(currentQuantity) : (startingQuantity ? Number(startingQuantity) : 0),
        });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.createItem = createItem;
// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private/Admin
const updateItem = async (req, res) => {
    const { name, category, unit, minStockAlert, minCartStockAlert, minInventoryStockAlert, startingQuantity, currentQuantity } = req.body;
    try {
        const item = await Item_1.default.findById(req.params.id);
        if (item) {
            item.name = name || item.name;
            item.category = category || item.category;
            item.unit = unit || item.unit;
            if (minStockAlert !== undefined)
                item.minStockAlert = Number(minStockAlert);
            if (minCartStockAlert !== undefined)
                item.minCartStockAlert = Number(minCartStockAlert);
            if (minInventoryStockAlert !== undefined)
                item.minInventoryStockAlert = Number(minInventoryStockAlert);
            if (startingQuantity !== undefined)
                item.startingQuantity = Number(startingQuantity);
            if (currentQuantity !== undefined)
                item.currentQuantity = Number(currentQuantity);
            const updatedItem = await item.save();
            res.json(updatedItem);
        }
        else {
            res.status(404).json({ message: 'Item not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.updateItem = updateItem;
// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private/Admin
const deleteItem = async (req, res) => {
    try {
        const item = await Item_1.default.findById(req.params.id);
        if (item) {
            await item.deleteOne();
            res.json({ message: 'Item removed' });
        }
        else {
            res.status(404).json({ message: 'Item not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.deleteItem = deleteItem;
//# sourceMappingURL=itemController.js.map