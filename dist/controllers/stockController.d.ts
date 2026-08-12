import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const recordOpeningStock: (req: AuthRequest, res: Response) => Promise<void>;
export declare const recordReceivedStock: (req: AuthRequest, res: Response) => Promise<void>;
export declare const recordWastage: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getWastageLogs: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getStockLogs: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=stockController.d.ts.map