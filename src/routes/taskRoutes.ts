import express from 'express';
import { getTasks, createTask, deleteTask } from '../controllers/taskController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getTasks);
router.post('/', protect, admin, createTask);
router.delete('/:id', protect, admin, deleteTask);

export default router;
