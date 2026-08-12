import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const uploadPhoto: (req: AuthRequest, res: Response) => Promise<void>;
export declare const openShift: (req: AuthRequest, res: Response) => Promise<void>;
export declare const goLiveShift: (req: AuthRequest, res: Response) => Promise<void>;
export declare const closeShift: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCurrentShift: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getShiftById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getShifts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getShiftStatusAndPhotos: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=shiftController.d.ts.map