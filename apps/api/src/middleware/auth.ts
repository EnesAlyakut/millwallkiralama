import { Request, Response, NextFunction } from 'express';
import { jwtVerify, SignJWT } from 'jose';
import { prisma } from '@kiralama/database';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  branchId?: string | null;
  staffBranchId?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh');

export async function generateToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    branchId: user.branchId,
    staffBranchId: user.staffBranchId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '15m')
    .sign(JWT_SECRET);
}

export async function generateRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ id: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN || '7d')
    .sign(JWT_REFRESH_SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as unknown as AuthUser;
}

export async function verifyRefreshToken(token: string): Promise<{ id: string }> {
  const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
  return payload as unknown as { id: string };
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Yetkilendirme gerekli. Lütfen giriş yapın.' });
  }

  const token = authHeader.split(' ')[1];
  
  verifyToken(token)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(() => {
      return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş oturum. Lütfen tekrar giriş yapın.' });
    });
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmuyor.' });
    }
    next();
  };
}

export function checkPermission(permissionName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli.' });
    }

    // Super admin has all permissions
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    try {
      const userPermission = await prisma.userPermission.findFirst({
        where: {
          userId: req.user.id,
          permission: { name: permissionName },
          granted: true,
        },
      });

      if (!userPermission) {
        return res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmuyor.' });
      }

      next();
    } catch {
      return res.status(500).json({ error: 'Yetki kontrolü sırasında hata oluştu.' });
    }
  };
}
