import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '@kiralama/database';
import { authenticate, authorize } from '../middleware/auth';
import { createAuditLog } from '../services/auditService';

export const usersRouter = Router();

// List users (admin)
usersRouter.get('/', authenticate, authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), async (req: Request, res: Response) => {
  try {
    const { role, search, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { deletedAt: null };
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search as string } },
        { lastName: { contains: search as string } },
        { email: { contains: search as string } },
      ];
    }

    // Branch managers can only see their branch users
    if (req.user!.role === 'BRANCH_MANAGER' && req.user!.branchId) {
      where.OR = [
        { branchId: req.user!.branchId },
        { staffBranchId: req.user!.branchId },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          phone: true, role: true, isActive: true, createdAt: true,
          lastLoginAt: true, branchId: true, staffBranchId: true,
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcılar listelenemedi.' });
  }
});

// Get user by ID
usersRouter.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, avatar: true, role: true, isActive: true,
        createdAt: true, branchId: true, staffBranchId: true,
        customerProfile: true, corporateProfile: true,
        permissions: { include: { permission: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcı bilgileri alınamadı.' });
  }
});

// Create user (admin)
usersRouter.post('/', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, role, branchId, staffBranchId } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Bu e-posta zaten kayıtlı.' });

    const hashedPassword = await bcrypt.hash(password || 'Temp1234!', 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName, phone, role: role || 'STAFF', branchId, staffBranchId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    });

    await createAuditLog({ userId: req.user!.id, action: 'CREATE_USER', entity: 'users', entityId: user.id, ipAddress: req.ip });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcı oluşturulamadı.' });
  }
});

// Update user
usersRouter.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const isOwnProfile = req.user!.id === req.params.id;
    const isAdmin = req.user!.role === 'SUPER_ADMIN';
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok.' });
    }

    const { firstName, lastName, phone, avatar, isActive, role, branchId, staffBranchId } = req.body;
    const data: any = {};
    if (firstName) data.firstName = firstName;
    if (lastName) data.lastName = lastName;
    if (phone !== undefined) data.phone = phone;
    if (avatar !== undefined) data.avatar = avatar;
    if (isAdmin) {
      if (isActive !== undefined) data.isActive = isActive;
      if (role) data.role = role;
      if (branchId !== undefined) data.branchId = branchId;
      if (staffBranchId !== undefined) data.staffBranchId = staffBranchId;
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true },
    });

    await createAuditLog({ userId: req.user!.id, action: 'UPDATE_USER', entity: 'users', entityId: user.id, ipAddress: req.ip });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcı güncellenemedi.' });
  }
});

// Update user permissions (admin)
usersRouter.put('/:id/permissions', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { permissions } = req.body; // Array of { permissionId, granted }

    // Remove existing and recreate
    await prisma.userPermission.deleteMany({ where: { userId: req.params.id } });

    if (permissions && permissions.length > 0) {
      await prisma.userPermission.createMany({
        data: permissions.map((p: any) => ({
          userId: req.params.id,
          permissionId: p.permissionId,
          granted: p.granted ?? true,
        })),
      });
    }

    await createAuditLog({ userId: req.user!.id, action: 'UPDATE_PERMISSIONS', entity: 'users', entityId: req.params.id, ipAddress: req.ip });
    res.json({ message: 'Yetkiler güncellendi.' });
  } catch (error) {
    res.status(500).json({ error: 'Yetkiler güncellenemedi.' });
  }
});

// Soft delete user (admin)
usersRouter.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    });
    await createAuditLog({ userId: req.user!.id, action: 'DELETE_USER', entity: 'users', entityId: req.params.id, ipAddress: req.ip });
    res.json({ message: 'Kullanıcı silindi.' });
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcı silinemedi.' });
  }
});
