import { Router, Request, Response } from 'express';
import { prisma } from '@kiralama/database';
import { authenticate } from '../middleware/auth';

export const favoritesRouter = Router();

favoritesRouter.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      include: { product: { include: { images: { where: { isPrimary: true }, take: 1 }, pricingRules: { where: { type: 'DAILY', isActive: true }, take: 1 }, category: { select: { name: true, slug: true } }, branch: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(favorites);
  } catch { res.status(500).json({ error: 'Favoriler listelenemedi.' }); }
});

favoritesRouter.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const favorite = await prisma.favorite.create({ data: { userId: req.user!.id, productId: req.body.productId } });
    res.status(201).json(favorite);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Zaten favorilerinizde.' });
    res.status(500).json({ error: 'Favorilere eklenemedi.' });
  }
});

favoritesRouter.delete('/:productId', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.favorite.deleteMany({ where: { userId: req.user!.id, productId: req.params.productId } });
    res.json({ message: 'Favorilerden kaldırıldı.' });
  } catch { res.status(500).json({ error: 'Favorilerden kaldırılamadı.' }); }
});
