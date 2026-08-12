import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import Item from '../models/Item';
import TaskMaster from '../models/TaskMaster';

async function seedData() {
  try {
    const mongoUri = process.env.MONGO_URI || '';
    if (!mongoUri) {
      console.error('MONGO_URI missing');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    // Seed Raw Material Items
    const defaultItems = [
      { name: 'Burger Buns', category: 'Packaging', unit: 'pcs', minStockAlert: 10, currentQuantity: 0, startingQuantity: 0 },
      { name: 'Veggie Patty', category: 'Ingredient', unit: 'pcs', minStockAlert: 15, currentQuantity: 0, startingQuantity: 0 },
      { name: 'Cheese Slices', category: 'Ingredient', unit: 'pcs', minStockAlert: 10, currentQuantity: 0, startingQuantity: 0 },
      { name: 'Cooking Oil', category: 'Consumable', unit: 'L', minStockAlert: 2, currentQuantity: 0, startingQuantity: 0 },
      { name: 'Special Burger Sauce', category: 'Ingredient', unit: 'ml', minStockAlert: 500, currentQuantity: 0, startingQuantity: 0 },
    ];

    for (const itemData of defaultItems) {
      await Item.updateOne(
        { name: itemData.name },
        { $setOnInsert: itemData },
        { upsert: true }
      );
    }
    console.log('✅ Seeded default Raw Material Items');

    // Seed Opening & Closing Tasks
    const defaultTasks = [
      { title: 'Check Gas Cylinder Connection', type: 'Opening', requiresPhoto: true, active: true },
      { title: 'Clean & Sanitize Counter', type: 'Opening', requiresPhoto: true, active: true },
      { title: 'Verify POS / Machine Battery', type: 'Opening', requiresPhoto: false, active: true },
      { title: 'Turn Off Griddle & Appliances', type: 'Closing', requiresPhoto: true, active: true },
      { title: 'Lock Storage & Cart Canopy', type: 'Closing', requiresPhoto: true, active: true },
    ];

    for (const taskData of defaultTasks) {
      await TaskMaster.updateOne(
        { title: taskData.title, type: taskData.type } as any,
        { $setOnInsert: taskData } as any,
        { upsert: true }
      );
    }
    console.log('✅ Seeded default Tasks');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seedData();
