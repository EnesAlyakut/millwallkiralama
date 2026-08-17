import { Router, Request, Response } from 'express';
import { prisma } from '@kiralama/database';
import { authenticate, authorize } from '../middleware/auth';

export const dashboardRouter = Router();

dashboardRouter.get('/', authenticate, authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), async (req: Request, res: Response) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const yearStart = new Date(today.getFullYear(), 0, 1);

    const branchFilter: any = {};
    if (req.user!.role === 'BRANCH_MANAGER' && req.user!.branchId) {
      branchFilter.pickupBranchId = req.user!.branchId;
    }

    const [
      todayReservations, todayDeliveries, todayReturns,
      activeRentals, totalCustomers,
      availableProducts, maintenanceProducts,
      monthlyPayments, yearlyPayments,
      pendingPayments, pendingOffers,
      recentReservations,
    ] = await Promise.all([
      prisma.reservation.count({ where: { ...branchFilter, pickupDate: { gte: today, lt: tomorrow } } }),
      prisma.delivery.count({ where: { deliveredAt: { gte: today, lt: tomorrow } } }),
      prisma.return.count({ where: { returnedAt: { gte: today, lt: tomorrow } } }),
      prisma.reservation.count({ where: { ...branchFilter, status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } }),
      prisma.product.count({ where: { status: 'AVAILABLE', deletedAt: null } }),
      prisma.product.count({ where: { status: 'MAINTENANCE' } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED', paidAt: { gte: monthStart } }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED', paidAt: { gte: yearStart } }, _sum: { amount: true } }),
      prisma.reservation.count({ where: { ...branchFilter, status: 'PAYMENT_PENDING' } }),
      prisma.offer.count({ where: { status: 'PENDING' } }),
      prisma.reservation.findMany({
        where: branchFilter,
        include: { customer: { select: { firstName: true, lastName: true } }, items: { include: { product: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' }, take: 10,
      }),
    ]);

    res.json({
      todayReservations, todayDeliveries, todayReturns,
      activeRentals, totalCustomers,
      availableProducts, maintenanceProducts,
      monthlyRevenue: monthlyPayments._sum.amount || 0,
      yearlyRevenue: yearlyPayments._sum.amount || 0,
      pendingPayments, pendingOffers,
      recentReservations,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Dashboard verileri yüklenemedi.' });
  }
});
