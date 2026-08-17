import { Router, Request, Response } from 'express';
import { prisma } from '@kiralama/database';
import { authenticate } from '../middleware/auth';

export const extrasRouter = Router();

extrasRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const extras = await prisma.extra.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    res.json(extras);
  } catch { res.status(500).json({ error: 'Ek hizmetler listelenemedi.' }); }
});

extrasRouter.post('/', authenticate, async (req: Request, res: Response) => {
  try { const extra = await prisma.extra.create({ data: req.body }); res.status(201).json(extra); }
  catch { res.status(500).json({ error: 'Ek hizmet oluşturulamadı.' }); }
});

extrasRouter.put('/:id', authenticate, async (req: Request, res: Response) => {
  try { const extra = await prisma.extra.update({ where: { id: req.params.id }, data: req.body }); res.json(extra); }
  catch { res.status(500).json({ error: 'Ek hizmet güncellenemedi.' }); }
});

extrasRouter.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try { await prisma.extra.delete({ where: { id: req.params.id } }); res.json({ message: 'Silindi.' }); }
  catch { res.status(500).json({ error: 'Ek hizmet silinemedi.' }); }
});
