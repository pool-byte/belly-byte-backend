import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db';

dotenv.config();

const app = express();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded photos
app.use('/uploads', express.static(uploadsDir));

// Connect Database
connectDB();

import authRoutes from './routes/authRoutes';
import itemRoutes from './routes/itemRoutes';
import shiftRoutes from './routes/shiftRoutes';
import stockRoutes from './routes/stockRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import foodItemRoutes from './routes/foodItemRoutes';
import saleRoutes from './routes/saleRoutes';
import reportRoutes from './routes/reportRoutes';
import alertRoutes from './routes/alertRoutes';
import taskRoutes from './routes/taskRoutes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/fooditems', foodItemRoutes);
app.use('/api/recipes', foodItemRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req: any, res: any) => {
  res.send('BellyBites Cart API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
