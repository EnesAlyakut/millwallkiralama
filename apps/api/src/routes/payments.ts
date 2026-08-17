import { Router, Request, Response } from 'express';
import { prisma } from '@kiralama/database';
import { authenticate, authorize } from '../middleware/auth';
import { createAuditLog } from '../services/auditService';

export const paymentsRouter = Router();

paymentsRouter.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const where: any = {};
    if (req.user!.role === 'CUSTOMER') {
      where.reservation = { customerId: req.user!.id };
    }
    const { status, page = '1', limit = '20' } = req.query;
    if (status) where.status = status;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where, include: { reservation: { select: { id: true, reservationNo: true, customerId: true, customer: { select: { firstName: true, lastName: true } } } } },
        skip, take: parseInt(limit as string), orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);
    res.json({ payments, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch { res.status(500).json({ error: 'Ödemeler listelenemedi.' }); }
});

paymentsRouter.post('/', authenticate, authorize('SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF'), async (req: Request, res: Response) => {
  try {
    const { reservationId, amount, method, description } = req.body;
    const payment = await prisma.payment.create({
      data: { reservationId, amount, method, description, status: 'COMPLETED', paidAt: new Date() },
    });
    // Update reservation paid amount
    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
    if (reservation) {
      const newPaid = reservation.paidAmount + amount;
      const newStatus = newPaid >= reservation.totalAmount ? 'PAID' : 'PAYMENT_PENDING';
      await prisma.reservation.update({ where: { id: reservationId }, data: { paidAmount: newPaid, status: reservation.status === 'PAYMENT_PENDING' ? newStatus : reservation.status } });
    }
    await createAuditLog({ userId: req.user!.id, action: 'CREATE_PAYMENT', entity: 'payments', entityId: payment.id, newValues: { amount, method }, ipAddress: req.ip });
    res.status(201).json(payment);
  } catch { res.status(500).json({ error: 'Ödeme kaydedilemedi.' }); }
});

paymentsRouter.put('/:id/refund', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const payment = await prisma.payment.update({ where: { id: req.params.id }, data: { status: 'REFUNDED', refundedAt: new Date() } });
    await createAuditLog({ userId: req.user!.id, action: 'REFUND_PAYMENT', entity: 'payments', entityId: payment.id, ipAddress: req.ip });
    res.json(payment);
  } catch { res.status(500).json({ error: 'İade işlemi başarısız.' }); }
});
