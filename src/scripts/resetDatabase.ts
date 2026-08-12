import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import Shift from '../models/Shift';
import StockUpdate from '../models/StockUpdate';
import Wastage from '../models/Wastage';
import Sale from '../models/Sale';
import FoodItem from '../models/FoodItem';
import Alert from '../models/Alert';
import ShiftReport from '../models/ShiftReport';
import Item from '../models/Item';
import TaskMaster from '../models/TaskMaster';

async function resetDB() {
  try {
    const mongoUri = process.env.MONGO_URI || '';
    if (!mongoUri) {
      console.error('MONGO_URI missing');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    console.log('Clearing operational collections (keeping User accounts intact)...');
    await Shift.deleteMany({});
    await StockUpdate.deleteMany({});
    await Wastage.deleteMany({});
    await Sale.deleteMany({});
    await FoodItem.deleteMany({});
    await Alert.deleteMany({});
    await ShiftReport.deleteMany({});
    await Item.deleteMany({});
    await TaskMaster.deleteMany({});

    console.log('✅ Successfully wiped all DB collections except Users!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error resetting database:', err);
    process.exit(1);
  }
}

resetDB();
