import { Request, Response } from 'express';
import Item from '../models/Item';

// @desc    Get all items (with optional category filter)
// @route   GET /api/items
// @access  Private
export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const filter = category ? { category: String(category) } : {};
    const items = await Item.find(filter).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Private
export const getItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Create an item
// @route   POST /api/items
// @access  Private/Admin
export const createItem = async (req: Request, res: Response): Promise<void> => {
  const { name, category, unit, minStockAlert, startingQuantity, currentQuantity } = req.body;

  try {
    const itemExists = await Item.findOne({ name });

    if (itemExists) {
      res.status(400).json({ message: 'Item already exists' });
      return;
    }

    const item = await Item.create({
      name,
      category: category || 'Ingredient',
      unit: unit || 'kg',
      minStockAlert: minStockAlert !== undefined ? Number(minStockAlert) : 0,
      startingQuantity: startingQuantity !== undefined ? Number(startingQuantity) : 0,
      currentQuantity: currentQuantity !== undefined ? Number(currentQuantity) : (startingQuantity ? Number(startingQuantity) : 0),
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private/Admin
export const updateItem = async (req: Request, res: Response): Promise<void> => {
  const { name, category, unit, minStockAlert, startingQuantity, currentQuantity } = req.body;

  try {
    const item = await Item.findById(req.params.id);

    if (item) {
      item.name = name || item.name;
      item.category = category || item.category;
      item.unit = unit || item.unit;
      item.minStockAlert = minStockAlert !== undefined ? Number(minStockAlert) : item.minStockAlert;
      if (startingQuantity !== undefined) item.startingQuantity = Number(startingQuantity);
      if (currentQuantity !== undefined) item.currentQuantity = Number(currentQuantity);

      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private/Admin
export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id);

    if (item) {
      await item.deleteOne();
      res.json({ message: 'Item removed' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
