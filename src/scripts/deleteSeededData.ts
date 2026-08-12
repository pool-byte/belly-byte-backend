import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import Item from '../models/Item';
import TaskMaster from '../models/TaskMaster';

async function cleanupSeededData() {
  try {
    const mongoUri = process.env.MONGO_URI || '';
    if (!mongoUri) {
      console.error('MONGO_URI missing');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    const seededItemNames = [
      'Burger Buns',
      'Veggie Patty',
      'Cheese Slices',
      'Cooking Oil',
      'Special Burger Sauce',
    ];

    const seededTaskTitles = [
      'Check Gas Cylinder Connection',
      'Clean & Sanitize Counter',
      'Verify POS / Machine Battery',
      'Turn Off Griddle & Appliances',
      'Lock Storage & Cart Canopy',
    ];

    const deletedItems = await Item.deleteMany({ name: { $in: seededItemNames } });
    console.log(`Deleted ${deletedItems.deletedCount} seeded items`);

    const deletedTasks = await TaskMaster.deleteMany({ title: { $in: seededTaskTitles } });
    console.log(`Deleted ${deletedTasks.deletedCount} seeded tasks`);

    console.log('✅ Removed auto-seeded data. Only admin-created items & tasks remain!');
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning seeded data:', err);
    process.exit(1);
  }
}

cleanupSeededData();
