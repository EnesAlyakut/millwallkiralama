import { Router, Request, Response } from 'express';
import { prisma } from '@kiralama/database';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { branchSchema } from '@kiralama/shared';
import { createAuditLog } from '../services/auditService';

export const branchesRouter = Router();

// List branches (public)
branchesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const branches = await prisma.branch.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { name: 'asc' },
    });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: 'Şubeler listelenemedi.' });
  }
});

// Get branch by ID
branchesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const branch = await prisma.branch.findUnique({ where: { id: req.params.id } });
    if (!branch) return res.status(404).json({ error: 'Şube bulunamadı.' });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ error: 'Şube bilgileri alınamadı.' });
  }
});

// Create branch (admin)
branchesRouter.post('/', authenticate, authorize('SUPER_ADMIN'), validate(branchSchema), async (req: Request, res: Response) => {
  try {
    const branch = await prisma.branch.create({ data: req.body });
    await createAuditLog({ userId: req.user!.id, action: 'CREATE_BRANCH', entity: 'branches', entityId: branch.id, newValues: req.body, ipAddress: req.ip });
    res.status(201).json(branch);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Bu şube kodu zaten mevcut.' });
    res.status(500).json({ error: 'Şube oluşturulamadı.' });
  }
});

// Update branch
branchesRouter.put('/:id', authenticate, authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), async (req: Request, res: Response) => {
  try {
    if (req.user!.role === 'BRANCH_MANAGER' && req.user!.branchId !== req.params.id) {
      return res.status(403).json({ error: 'Sadece kendi şubenizi düzenleyebilirsiniz.' });
    }
    const old = await prisma.branch.findUnique({ where: { id: req.params.id } });
    const branch = await prisma.branch.update({ where: { id: req.params.id }, data: req.body });
    await createAuditLog({ userId: req.user!.id, action: 'UPDATE_BRANCH', entity: 'branches', entityId: branch.id, oldValues: old as any, newValues: req.body, ipAddress: req.ip });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ error: 'Şube güncellenemedi.' });
  }
});

// Delete branch (soft)
branchesRouter.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    await prisma.branch.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), isActive: false } });
    await createAuditLog({ userId: req.user!.id, action: 'DELETE_BRANCH', entity: 'branches', entityId: req.params.id, ipAddress: req.ip });
    res.json({ message: 'Şube silindi.' });
  } catch (error) {
    res.status(500).json({ error: 'Şube silinemedi.' });
  }
});
