import { Router, Request, Response } from 'express';
import { prisma } from '@kiralama/database';
import { authenticate } from '../middleware/auth';

export const notificationsRouter = Router();

notificationsRouter.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({ where: { userId: req.user!.id, isRead: false } });
    res.json({ notifications, unreadCount });
  } catch { res.status(500).json({ error: 'Bildirimler yüklenemedi.' }); }
});

notificationsRouter.put('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true, readAt: new Date() } });
    res.json({ message: 'Okundu.' });
  } catch { res.status(500).json({ error: 'Bildirim güncellenemedi.' }); }
});

notificationsRouter.put('/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user!.id, isRead: false }, data: { isRead: true, readAt: new Date() } });
    res.json({ message: 'Tümü okundu.' });
  } catch { res.status(500).json({ error: 'Bildirimler güncellenemedi.' }); }
});
