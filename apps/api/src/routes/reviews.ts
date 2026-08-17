import { Router, Request, Response } from 'express';
import { prisma } from '@kiralama/database';
import { authenticate, authorize } from '../middleware/auth';

export const reviewsRouter = Router();

reviewsRouter.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId, isPublished: true },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const avg = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    res.json({ reviews, average: Math.round(avg * 10) / 10, total: reviews.length });
  } catch { res.status(500).json({ error: 'Yorumlar listelenemedi.' }); }
});

reviewsRouter.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const review = await prisma.review.create({ data: { ...req.body, userId: req.user!.id } });
    res.status(201).json(review);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Bu ürüne zaten yorum yaptınız.' });
    res.status(500).json({ error: 'Yorum eklenemedi.' });
  }
});

reviewsRouter.get('/pending', authenticate, authorize('SUPER_ADMIN'), async (_req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: false },
      include: { user: { select: { firstName: true, lastName: true } }, product: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch { res.status(500).json({ error: 'Bekleyen yorumlar listelenemedi.' }); }
});

reviewsRouter.put('/:id/approve', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const review = await prisma.review.update({ where: { id: req.params.id }, data: { isApproved: true, isPublished: true } });
    res.json(review);
  } catch { res.status(500).json({ error: 'Yorum onaylanamadı.' }); }
});

reviewsRouter.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try { await prisma.review.delete({ where: { id: req.params.id } }); res.json({ message: 'Yorum silindi.' }); }
  catch { res.status(500).json({ error: 'Yorum silinemedi.' }); }
});
