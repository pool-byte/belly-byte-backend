import { Request, Response } from 'express';
import TaskMaster from '../models/TaskMaster';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all active task master items (optional filter by ?type=Opening|Closing)
// @route   GET /api/tasks
// @access  Public / Private
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.query;
    const query: any = { active: true };
    if (type) {
      query.type = type;
    }
    const tasks = await TaskMaster.find(query).sort({ createdAt: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Create a new task master item
// @route   POST /api/tasks
// @access  Private/Admin
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, type, requiresPhoto } = req.body;

    if (!title || !type) {
      res.status(400).json({ message: 'Title and type (Opening/Closing) are required.' });
      return;
    }

    const task = await TaskMaster.create({
      title,
      type,
      requiresPhoto: requiresPhoto ?? true,
      active: true,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Delete/Deactivate a task master item
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await TaskMaster.findByIdAndDelete(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
