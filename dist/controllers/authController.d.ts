import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const loginUser: (req: Request, res: Response) => Promise<void>;
export declare const registerUser: (req: Request, res: Response) => Promise<void>;
export declare const getUserProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updatePushToken: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map