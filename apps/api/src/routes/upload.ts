import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import { authenticate } from '../middleware/auth';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '..', '..', 'uploads')),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Desteklenmeyen dosya türü.'));
  },
});

export const uploadRouter = Router();

uploadRouter.post('/', authenticate, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'Dosya yüklenemedi.' });
  res.json({ url: `/uploads/${req.file.filename}`, originalName: req.file.originalname, size: req.file.size, mimeType: req.file.mimetype });
});

uploadRouter.post('/multiple', authenticate, upload.array('files', 10), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) return res.status(400).json({ error: 'Dosya yüklenemedi.' });
  res.json(files.map(f => ({ url: `/uploads/${f.filename}`, originalName: f.originalname, size: f.size, mimeType: f.mimetype })));
});
