import { Response } from 'express';
import Shift from '../models/Shift';
import { AuthRequest } from '../middleware/authMiddleware';
import { createShiftReport } from '../services/shiftReportService';
import { getFilePath, resolvePhotoUrl } from '../middleware/uploadMiddleware';
import { sendAdminPushNotification } from '../services/notificationService';

// @desc    Upload a single photo file
// @route   POST /api/shifts/upload-photo
// @access  Private
export const uploadPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const photoUrl = getFilePath(req.file);
    if (!photoUrl) {
      res.status(400).json({ message: 'No photo file provided' });
      return;
    }
    res.json({ photoUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Open a new shift
// @route   POST /api/shifts/open
// @access  Private
export const openShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)._id;
    const existingShift = await Shift.findOne({
      workerId: userId,
      status: { $in: ['Opening', 'Live'] },
    } as any);

    if (existingShift) {
      res.json(existingShift);
      return;
    }

    const shift = await Shift.create({
      workerId: userId,
      status: 'Opening',
      openingStockEntered: false,
    });

    res.status(201).json(shift);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Go live with shift (6-point Cart Live Checklist + Tasks + Photo)
// @route   PUT /api/shifts/:id/live
// @access  Private
export const goLiveShift = async (req: AuthRequest, res: Response): Promise<void> => {
  const photoUrl = getFilePath(req.file, req.body.livePhotoUrl);
  const {
    locationVerified,
    preparationDone,
    grillingSetup,
    chargingLightWorking,
    cameraActive,
    cartLiveStatus,
    notes,
    taskSubmissions,
  } = req.body;

  try {
    const shift = await Shift.findById(req.params.id);

    if (shift) {
      shift.status = 'Live';
      shift.goLiveTime = new Date();
      shift.cartLiveChecklist = {
        locationVerified: Boolean(locationVerified === true || locationVerified === 'true'),
        preparationDone: Boolean(preparationDone === true || preparationDone === 'true'),
        grillingSetup: Boolean(grillingSetup === true || grillingSetup === 'true'),
        chargingLightWorking: Boolean(chargingLightWorking === true || chargingLightWorking === 'true'),
        cameraActive: Boolean(cameraActive === true || cameraActive === 'true'),
        cartLiveStatus: Boolean(cartLiveStatus === true || cartLiveStatus === 'true'),
        livePhotoUrl: photoUrl || shift.cartLiveChecklist?.livePhotoUrl || '',
        notes: notes || '',
      };

      if (taskSubmissions) {
        let tasksArray: any[] = [];
        if (typeof taskSubmissions === 'string') {
          try {
            tasksArray = JSON.parse(taskSubmissions);
          } catch {
            tasksArray = [];
          }
        } else if (Array.isArray(taskSubmissions)) {
          tasksArray = taskSubmissions;
        }
        if (tasksArray.length > 0) {
          const currentTasks = shift.taskSubmissions || [];
          shift.taskSubmissions = [...currentTasks, ...tasksArray];
        }
      }

      const updatedShift = await shift.save();
      res.json(updatedShift);
    } else {
      res.status(404).json({ message: 'Shift not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Close shift (Closing Checklist + Tasks + Photo)
// @route   PUT /api/shifts/:id/close
// @access  Private
export const closeShift = async (req: AuthRequest, res: Response): Promise<void> => {
  const photoUrl = getFilePath(req.file, req.body.closingPhotoUrl);
  const { cartLocked, chainLocked, remainingStockPacked, notes, taskSubmissions } = req.body;

  try {
    const shift = await Shift.findById(req.params.id);

    if (shift) {
      shift.status = 'Closed';
      shift.closeTime = new Date();
      shift.closingChecklist = {
        cartLocked: Boolean(cartLocked === true || cartLocked === 'true'),
        chainLocked: Boolean(chainLocked === true || chainLocked === 'true'),
        remainingStockPacked: Boolean(remainingStockPacked === true || remainingStockPacked === 'true'),
        closingPhotoUrl: photoUrl || shift.closingChecklist?.closingPhotoUrl || '',
        notes: notes || '',
      };

      if (taskSubmissions) {
        let tasksArray: any[] = [];
        if (typeof taskSubmissions === 'string') {
          try {
            tasksArray = JSON.parse(taskSubmissions);
          } catch {
            tasksArray = [];
          }
        } else if (Array.isArray(taskSubmissions)) {
          tasksArray = taskSubmissions;
        }
        if (tasksArray.length > 0) {
          const currentTasks = shift.taskSubmissions || [];
          shift.taskSubmissions = [...currentTasks, ...tasksArray];
        }
      }

      const updatedShift = await shift.save();
      const report = await createShiftReport(shift._id.toString());
      res.json({ shift: updatedShift, report });
    } else {
      res.status(404).json({ message: 'Shift not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Get current worker's active shift
// @route   GET /api/shifts/current
// @access  Private
export const getCurrentShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const userId = (req.user as any)._id;
    const shift = await Shift.findOne({
      workerId: userId,
      status: { $in: ['Opening', 'Live'] },
    } as any).sort({ createdAt: -1 });

    if (shift) {
      res.json(shift);
    } else {
      res.status(404).json({ message: 'No active shift found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Get single shift details by ID
// @route   GET /api/shifts/:id
// @access  Private
export const getShiftById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shift = await Shift.findById(req.params.id).populate('workerId', 'name phone');
    if (!shift) {
      res.status(404).json({ message: 'Shift not found' });
      return;
    }
    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Get all shifts
// @route   GET /api/shifts
// @access  Private/Admin
export const getShifts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shifts = await Shift.find({}).populate('workerId', 'name phone').sort({ createdAt: -1 });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Get shift status & photos for admin tracking
// @route   GET /api/shifts/status-photos
// @access  Private/Admin
export const getShiftStatusAndPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shifts = await Shift.find({})
      .populate('workerId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(15);

    const rawPhotos: any[] = [];

    shifts.forEach((shift) => {
      const workerName = (shift.workerId as any)?.name || 'Unknown';
      const shiftDate = new Date(shift.date).toLocaleDateString();

      // Cart Go Live Photo
      if (shift.cartLiveChecklist?.livePhotoUrl) {
        rawPhotos.push({
          title: `Cart Go Live Photo`,
          subtitle: `Worker: ${workerName} • Date: ${shiftDate}`,
          stage: 'Opening',
          time: shift.goLiveTime ? new Date(shift.goLiveTime).toLocaleTimeString() : 'N/A',
          uri: shift.cartLiveChecklist.livePhotoUrl,
        });
      }

      // Closing Photo
      if (shift.closingChecklist?.closingPhotoUrl) {
        rawPhotos.push({
          title: `Shift Closing Photo`,
          subtitle: `Worker: ${workerName} • Date: ${shiftDate}`,
          stage: 'Closing',
          time: shift.closeTime ? new Date(shift.closeTime).toLocaleTimeString() : 'N/A',
          uri: shift.closingChecklist.closingPhotoUrl,
        });
      }

      // Task Submissions Photos
      if (shift.taskSubmissions && shift.taskSubmissions.length > 0) {
        shift.taskSubmissions.forEach((ts) => {
          if (ts.photoUrl) {
            rawPhotos.push({
              title: `${ts.title} (${ts.type} Task)`,
              subtitle: `Worker: ${workerName} • Date: ${shiftDate}`,
              stage: ts.type === 'Opening' ? 'Opening' : 'Closing',
              time: ts.submittedAt ? new Date(ts.submittedAt).toLocaleTimeString() : 'N/A',
              uri: ts.photoUrl,
              inputValue: ts.inputValue || '',
            });
          }
        });
      }
    });

    const resultPhotos = await Promise.all(
      rawPhotos.map(async (p) => ({
        ...p,
        uri: await resolvePhotoUrl(p.uri),
      }))
    );

    res.json(resultPhotos);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
