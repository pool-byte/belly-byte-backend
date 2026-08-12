import multer from 'multer';
export declare const isS3Configured: boolean;
export declare const getFilePath: (file?: Express.Multer.File, fallback?: string) => string;
export declare const resolvePhotoUrl: (url?: string) => Promise<string>;
declare const upload: multer.Multer;
export default upload;
//# sourceMappingURL=uploadMiddleware.d.ts.map