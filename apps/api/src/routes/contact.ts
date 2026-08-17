import { Router, Request, Response } from 'express';
import { prisma } from '@kiralama/database';

export const contactRouter = Router();

contactRouter.post('/', async (req: Request, res: Response) => {
  try {
    const message = await prisma.contactMessage.create({ data: req.body });
    res.status(201).json({ message: 'Mesajınız alındı. En kısa sürede dönüş yapılacaktır.' });
  } catch { res.status(500).json({ error: 'Mesaj gönderilemedi.' }); }
});

contactRouter.get('/', async (req: Request, res: Response) => {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(messages);
  } catch { res.status(500).json({ error: 'Mesajlar listelenemedi.' }); }
});
