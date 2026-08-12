import express from 'express';
import {
  openShift,
  goLiveShift,
  closeShift,
  getShifts,
  getCurrentShift,
  getShiftById,
  getShiftStatusAndPhotos,
  uploadPhoto,
} from '../controllers/shiftController';
import { protect, admin } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

router.get('/current', protect, getCurrentShift);
router.get('/status-photos', protect, admin, getShiftStatusAndPhotos);
router.get('/', protect, getShifts);
router.get('/:id', protect, getShiftById);

router.post('/upload-photo', protect, upload.single('photo'), uploadPhoto);
router.post('/open', protect, openShift);
router.put('/:id/live', protect, upload.single('photo'), goLiveShift);
router.put('/:id/close', protect, upload.single('photo'), closeShift);

export default router;
