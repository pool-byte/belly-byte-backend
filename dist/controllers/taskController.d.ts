import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const getTasks: (req: Request, res: Response) => Promise<void>;
export declare const createTask: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteTask: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=taskController.d.ts.map