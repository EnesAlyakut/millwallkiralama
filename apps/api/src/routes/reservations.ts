import { Router, Request, Response } from 'express';
import { prisma } from '@kiralama/database';
import { authenticate, authorize } from '../middleware/auth';
import { createAuditLog } from '../services/auditService';
import { generateReservationNo } from '@kiralama/shared';

export const reservationsRouter = Router();

// List reservations
reservationsRouter.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { status, customerId, branchId, page = '1', limit = '20', startDate, endDate } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const where: any = {};

    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (branchId) where.pickupBranchId = branchId;
    if (startDate) where.pickupDate = { gte: new Date(startDate as string) };
    if (endDate) where.returnDate = { ...where.returnDate, lte: new Date(endDate as string) };

    // Customer can only see their own
    if (req.user!.role === 'CUSTOMER') {
      where.customerId = req.user!.id;
    }
    // Branch manager can only see their branch
    if (req.user!.role === 'BRANCH_MANAGER' && req.user!.branchId) {
      where.OR = [
        { pickupBranchId: req.user!.branchId },
        { returnBranchId: req.user!.branchId },
      ];
    }

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          pickupBranch: { select: { id: true, name: true } },
          returnBranch: { select: { id: true, name: true } },
          items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } },
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.reservation.count({ where }),
    ]);

    res.json({ reservations, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error) {
    res.status(500).json({ error: 'Rezervasyonlar listelenemedi.' });
  }
});

// Get reservation by ID
reservationsRouter.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        pickupBranch: true, returnBranch: true,
        items: { include: { product: { include: { images: true, attributes: { include: { attribute: true } } } } } },
        extras: { include: { extra: true } },
        payments: true,
        contract: true,
        delivery: { include: { photos: true } },
        returnRecord: { include: { photos: true } },
        damageReports: { include: { photos: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        coupon: true,
        offer: true,
      },
    });
    if (!reservation) return res.status(404).json({ error: 'Rezervasyon bulunamadı.' });

    // Check access
    if (req.user!.role === 'CUSTOMER' && reservation.customerId !== req.user!.id) {
      return res.status(403).json({ error: 'Bu rezervasyonu görüntüleme yetkiniz yok.' });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Rezervasyon bilgileri alınamadı.' });
  }
});

// Create reservation
reservationsRouter.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { productId, pickupBranchId, returnBranchId, pickupDate, pickupTime, returnDate, returnTime, extras, couponCode, notes } = req.body;
    
    const customerId = req.user!.role === 'CUSTOMER' ? req.user!.id : (req.body.customerId || req.user!.id);

    // Check availability
    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    const conflict = await prisma.availability.findFirst({
      where: {
        productId,
        status: { in: ['RESERVED', 'RENTED'] },
        startDate: { lt: end },
        endDate: { gt: start },
      },
    });

    if (conflict) {
      return res.status(409).json({ error: 'Bu ürün seçilen tarihler için müsait değil.' });
    }

    // Calculate price
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { pricingRules: { where: { isActive: true } } },
    });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı.' });

    const totalDays = Math.max(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 1);
    const dailyRule = product.pricingRules.find(r => r.type === 'DAILY');
    const dailyRate = dailyRule?.price || 0;
    const subtotal = dailyRate * totalDays;

    // Handle coupon
    let discountAmount = 0;
    let couponId = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive && new Date() >= coupon.startDate && new Date() <= coupon.endDate) {
        if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
          if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
            discountAmount = coupon.discountType === 'PERCENTAGE' ? subtotal * (coupon.discountValue / 100) : coupon.discountValue;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
            couponId = coupon.id;
            await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
          }
        }
      }
    }

    // Calculate extras
    let extrasTotal = 0;
    const extraRecords: any[] = [];
    if (extras && Array.isArray(extras)) {
      for (const e of extras) {
        const extra = await prisma.extra.findUnique({ where: { id: e.extraId } });
        if (extra) {
          const qty = e.quantity || 1;
          const total = extra.priceType === 'DAILY' ? extra.price * totalDays * qty : extra.price * qty;
          extrasTotal += total;
          extraRecords.push({ extraId: extra.id, quantity: qty, unitPrice: extra.price, totalPrice: total });
        }
      }
    }

    const taxAmount = (subtotal + extrasTotal - discountAmount) * 0.20;
    const totalAmount = subtotal + extrasTotal - discountAmount + taxAmount;

    const reservation = await prisma.reservation.create({
      data: {
        reservationNo: generateReservationNo(),
        customerId,
        pickupBranchId,
        returnBranchId,
        pickupDate: start,
        pickupTime,
        returnDate: end,
        returnTime,
        status: 'APPROVAL_PENDING',
        subtotal: Math.round(subtotal),
        extrasTotal: Math.round(extrasTotal),
        discountAmount: Math.round(discountAmount),
        taxAmount: Math.round(taxAmount),
        totalAmount: Math.round(totalAmount),
        depositAmount: product.depositAmount,
        couponId,
        notes,
        items: {
          create: { productId, dailyRate, totalDays, totalAmount: Math.round(subtotal) },
        },
        extras: extraRecords.length > 0 ? { createMany: { data: extraRecords } } : undefined,
        statusHistory: {
          create: { toStatus: 'APPROVAL_PENDING', changedBy: req.user!.id, note: 'Rezervasyon oluşturuldu' },
        },
      },
      include: {
        items: { include: { product: true } },
        extras: { include: { extra: true } },
      },
    });

    // Create availability block
    await prisma.availability.create({
      data: { productId, startDate: start, endDate: end, status: 'RESERVED', reservationId: reservation.id },
    });

    await createAuditLog({ userId: req.user!.id, action: 'CREATE_RESERVATION', entity: 'reservations', entityId: reservation.id, ipAddress: req.ip });
    res.status(201).json(reservation);
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ error: 'Rezervasyon oluşturulamadı.' });
  }
});

// Update reservation status
reservationsRouter.put('/:id/status', authenticate, authorize('SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF'), async (req: Request, res: Response) => {
  try {
    const { status, note } = req.body;
    const old = await prisma.reservation.findUnique({ where: { id: req.params.id } });
    if (!old) return res.status(404).json({ error: 'Rezervasyon bulunamadı.' });

    const reservation = await prisma.reservation.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(status === 'CANCELLED' ? { cancelledAt: new Date(), cancelReason: note } : {}),
      },
    });

    await prisma.reservationStatusHistory.create({
      data: { reservationId: reservation.id, fromStatus: old.status, toStatus: status, changedBy: req.user!.id, note },
    });

    // Update availability on cancel
    if (status === 'CANCELLED') {
      await prisma.availability.deleteMany({ where: { reservationId: reservation.id } });
    }

    await createAuditLog({
      userId: req.user!.id, action: 'UPDATE_RESERVATION_STATUS', entity: 'reservations', entityId: reservation.id,
      oldValues: { status: old.status }, newValues: { status }, ipAddress: req.ip,
    });

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Rezervasyon durumu güncellenemedi.' });
  }
});

// Cancel reservation (customer)
reservationsRouter.post('/:id/cancel', authenticate, async (req: Request, res: Response) => {
  try {
    const reservation = await prisma.reservation.findUnique({ where: { id: req.params.id } });
    if (!reservation) return res.status(404).json({ error: 'Rezervasyon bulunamadı.' });
    if (req.user!.role === 'CUSTOMER' && reservation.customerId !== req.user!.id) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok.' });
    }

    const cancellable = ['DRAFT', 'APPROVAL_PENDING', 'APPROVED', 'PAYMENT_PENDING'];
    if (!cancellable.includes(reservation.status)) {
      return res.status(400).json({ error: 'Bu aşamada iptal yapılamaz.' });
    }

    // Calculate penalty
    const hoursUntilPickup = (reservation.pickupDate.getTime() - Date.now()) / (1000 * 60 * 60);
    const policies = await prisma.cancellationPolicy.findMany({ where: { isActive: true }, orderBy: { hoursBeforePickup: 'desc' } });
    let penaltyPercent = 0;
    for (const policy of policies) {
      if (hoursUntilPickup >= policy.hoursBeforePickup) {
        penaltyPercent = policy.penaltyPercent;
        break;
      }
    }
    if (penaltyPercent === 0 && policies.length > 0) {
      penaltyPercent = policies[policies.length - 1].penaltyPercent;
    }

    const penaltyAmount = Math.round(reservation.totalAmount * (penaltyPercent / 100));

    await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: req.body.reason || 'Müşteri iptal' },
    });

    await prisma.reservationStatusHistory.create({
      data: { reservationId: reservation.id, fromStatus: reservation.status, toStatus: 'CANCELLED', changedBy: req.user!.id, note: `İptal - %${penaltyPercent} kesinti (${penaltyAmount} TL)` },
    });

    await prisma.availability.deleteMany({ where: { reservationId: reservation.id } });

    res.json({ message: 'Rezervasyon iptal edildi.', penaltyPercent, penaltyAmount });
  } catch (error) {
    res.status(500).json({ error: 'İptal işlemi başarısız.' });
  }
});
