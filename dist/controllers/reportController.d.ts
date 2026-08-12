import { Request, Response } from 'express';
export declare const getHourlySalesReport: (req: Request, res: Response) => Promise<void>;
export declare const getDailySalesReport: (req: Request, res: Response) => Promise<void>;
export declare const getHourlyStockReport: (req: Request, res: Response) => Promise<void>;
export declare const getUsedStockReport: (req: Request, res: Response) => Promise<void>;
export declare const getExpectedClosingStockReport: (req: Request, res: Response) => Promise<void>;
export declare const getSevenDayAvgUsageReport: (req: Request, res: Response) => Promise<void>;
export declare const getDailyClosingReport: (req: Request, res: Response) => Promise<void>;
export declare const getSalesMismatchesReport: (req: Request, res: Response) => Promise<void>;
export declare const getShiftReports: (req: Request, res: Response) => Promise<void>;
export declare const getShiftReportById: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=reportController.d.ts.map