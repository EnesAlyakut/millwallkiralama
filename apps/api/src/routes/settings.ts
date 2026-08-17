import { Router, Request, Response } from 'express';
import { prisma } from '@kiralama/database';
import { authenticate, authorize } from '../middleware/auth';

export const settingsRouter = Router();

settingsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { group } = req.query;
    const where: any = {};
    if (group) where.group = group;
    const settings = await prisma.setting.findMany({ where, orderBy: { key: 'asc' } });
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });
    res.json(settingsMap);
  } catch { res.status(500).json({ error: 'Ayarlar yüklenemedi.' }); }
});

settingsRouter.put('/', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const settings = req.body; // { key: value, ... }
    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } });
    }
    res.json({ message: 'Ayarlar güncellendi.' });
  } catch { res.status(500).json({ error: 'Ayarlar güncellenemedi.' }); }
});
