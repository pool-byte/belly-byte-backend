import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import Item from '../models/Item';
import Shift from '../models/Shift';
import StockUpdate from '../models/StockUpdate';
import Wastage from '../models/Wastage';

async function checkPhotos() {
  try {
    const mongoUri = process.env.MONGO_URI || '';
    if (!mongoUri) {
      console.error('MONGO_URI missing');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    // Register Item model
    await Item.findOne({});

    const stockUpdates = await StockUpdate.find({}).populate('itemId', 'name');
    console.log(`\n--- StockUpdates count: ${stockUpdates.length} ---`);
    stockUpdates.forEach((su) => {
      console.log({
        id: su._id,
        type: su.type,
        item: (su.itemId as any)?.name || su.itemId,
        photoUrl: su.photoUrl,
        time: su.createdAt,
      });
    });

    const shifts = await Shift.find({});
    console.log(`\n--- Shifts count: ${shifts.length} ---`);
    shifts.forEach((s) => {
      console.log({
        id: s._id,
        status: s.status,
        cartLivePhoto: s.cartLiveChecklist?.livePhotoUrl,
        closingPhoto: s.closingChecklist?.closingPhotoUrl,
        taskSubmissionsCount: s.taskSubmissions?.length,
        taskSubmissions: s.taskSubmissions?.map((ts) => ({ title: ts.title, photoUrl: ts.photoUrl })),
      });
    });

    const wastage = await Wastage.find({});
    console.log(`\n--- Wastage count: ${wastage.length} ---`);
    wastage.forEach((w) => {
      console.log({
        id: w._id,
        photoUrl: w.photoUrl,
      });
    });

    process.exit(0);
  } catch (err) {
    console.error('Error checking photos in DB:', err);
    process.exit(1);
  }
}

checkPhotos();
