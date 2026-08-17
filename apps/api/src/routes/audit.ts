import { Router, Request, Response } from 'express';
import { prisma } from '@kiralama/database';
import { authenticate, authorize } from '../middleware/auth';

export const auditRouter = Router();

auditRouter.get('/', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { entity, userId, page = '1', limit = '50' } = req.query;
    const where: any = {};
    if (entity) where.entity = entity;
    if (userId) where.userId = userId;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where, include: { user: { select: { firstName: true, lastName: true, email: true } } },
        skip, take: parseInt(limit as string), orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);
    res.json({ logs, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch { res.status(500).json({ error: 'Audit logları yüklenemedi.' }); }
});
