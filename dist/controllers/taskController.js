"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.createTask = exports.getTasks = void 0;
const TaskMaster_1 = __importDefault(require("../models/TaskMaster"));
// @desc    Get all active task master items (optional filter by ?type=Opening|Closing)
// @route   GET /api/tasks
// @access  Public / Private
const getTasks = async (req, res) => {
    try {
        const { type } = req.query;
        const query = { active: true };
        if (type) {
            query.type = type;
        }
        const tasks = await TaskMaster_1.default.find(query).sort({ createdAt: 1 });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.getTasks = getTasks;
// @desc    Create a new task master item
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
    try {
        const { title, type, requiresPhoto } = req.body;
        if (!title || !type) {
            res.status(400).json({ message: 'Title and type (Opening/Closing) are required.' });
            return;
        }
        const task = await TaskMaster_1.default.create({
            title,
            type,
            requiresPhoto: requiresPhoto ?? true,
            active: true,
        });
        res.status(201).json(task);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.createTask = createTask;
// @desc    Delete/Deactivate a task master item
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await TaskMaster_1.default.findByIdAndDelete(id);
        res.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.deleteTask = deleteTask;
//# sourceMappingURL=taskController.js.map