import { Router, Request, Response } from 'express';
import { prisma } from '@kiralama/database';
import { authenticate, authorize } from '../middleware/auth';

export const offersRouter = Router();

offersRouter.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const where: any = {};
    if (req.user!.role === 'CUSTOMER') where.customerId = req.user!.id;
    const { status, page = '1', limit = '20' } = req.query;
    if (status) where.status = status;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [offers, total] = await Promise.all([
      prisma.offer.findMany({ where, include: { customer: { select: { id: true, firstName: true, lastName: true, email: true } } }, skip, take: parseInt(limit as string), orderBy: { createdAt: 'desc' } }),
      prisma.offer.count({ where }),
    ]);
    res.json({ offers, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch { res.status(500).json({ error: 'Teklifler listelenemedi.' }); }
});

offersRouter.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const offer = await prisma.offer.create({
      data: { ...req.body, customerId: req.user!.id, startDate: new Date(req.body.startDate), endDate: new Date(req.body.endDate) },
    });
    res.status(201).json(offer);
  } catch { res.status(500).json({ error: 'Teklif oluşturulamadı.' }); }
});

offersRouter.put('/:id/respond', authenticate, authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), async (req: Request, res: Response) => {
  try {
    const { offeredPrice, adminNote, validUntil } = req.body;
    const offer = await prisma.offer.update({
      where: { id: req.params.id },
      data: { offeredPrice, adminNote, validUntil: validUntil ? new Date(validUntil) : undefined, status: 'PRICE_OFFERED' },
    });
    res.json(offer);
  } catch { res.status(500).json({ error: 'Teklif yanıtlanamadı.' }); }
});

offersRouter.put('/:id/accept', authenticate, async (req: Request, res: Response) => {
  try {
    const offer = await prisma.offer.update({ where: { id: req.params.id }, data: { status: 'ACCEPTED', respondedAt: new Date() } });
    res.json(offer);
  } catch { res.status(500).json({ error: 'Teklif kabul edilemedi.' }); }
});

offersRouter.put('/:id/reject', authenticate, async (req: Request, res: Response) => {
  try {
    const offer = await prisma.offer.update({ where: { id: req.params.id }, data: { status: 'REJECTED', respondedAt: new Date() } });
    res.json(offer);
  } catch { res.status(500).json({ error: 'Teklif reddedilemedi.' }); }
});
