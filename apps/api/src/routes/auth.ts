import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '@kiralama/database';
import { registerSchema, loginSchema } from '@kiralama/shared';
import { authenticate, generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createAuditLog } from '../services/auditService';

export const authRouter = Router();

// Register
authRouter.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kayıtlı.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    // Create customer profile
    await prisma.customerProfile.create({
      data: { userId: user.id },
    });

    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    const refreshToken = await generateRefreshToken(user.id);

    await createAuditLog({
      userId: user.id,
      action: 'REGISTER',
      entity: 'users',
      entityId: user.id,
      ipAddress: req.ip,
    });

    res.status(201).json({
      user,
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Kayıt sırasında bir hata oluştu.' });
  }
});

// Login
authRouter.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        branchId: true,
        staffBranchId: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Hesabınız devre dışı bırakılmıştır.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      branchId: user.branchId,
      staffBranchId: user.staffBranchId,
    });
    const refreshToken = await generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await createAuditLog({
      userId: user.id,
      action: 'LOGIN',
      entity: 'users',
      entityId: user.id,
      ipAddress: req.ip,
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Giriş sırasında bir hata oluştu.' });
  }
});

// Refresh Token
authRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token gerekli.' });
    }

    const payload = await verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, branchId: true, staffBranchId: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Geçersiz oturum.' });
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      branchId: user.branchId,
      staffBranchId: user.staffBranchId,
    });
    const newRefreshToken = await generateRefreshToken(user.id);

    res.json({ token, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ error: 'Geçersiz refresh token.' });
  }
});

// Get Current User
authRouter.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, avatar: true, role: true, isActive: true,
        emailVerified: true, branchId: true, staffBranchId: true,
        createdAt: true, lastLoginAt: true,
        customerProfile: true,
        corporateProfile: true,
        permissions: { include: { permission: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcı bilgileri alınamadı.' });
  }
});
