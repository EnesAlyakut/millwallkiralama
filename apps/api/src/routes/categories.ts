import { Router, Request, Response } from 'express';
import { prisma } from '@kiralama/database';
import { authenticate, authorize } from '../middleware/auth';
import { createAuditLog } from '../services/auditService';
import { slugify } from '@kiralama/shared';

export const categoriesRouter = Router();

// List categories (public - hierarchical)
categoriesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { flat } = req.query;
    if (flat === 'true') {
      const categories = await prisma.category.findMany({
        where: { isActive: true, deletedAt: null },
        include: { _count: { select: { products: true } } },
        orderBy: { sortOrder: 'asc' },
      });
      return res.json(categories);
    }

    // Hierarchical (only root categories with children)
    const categories = await prisma.category.findMany({
      where: { parentId: null, isActive: true, deletedAt: null },
      include: {
        children: {
          where: { isActive: true, deletedAt: null },
          include: { _count: { select: { products: true } } },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Kategoriler listelenemedi.' });
  }
});

// Get category by slug (public)
categoriesRouter.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        attributes: { orderBy: { sortOrder: 'asc' } },
        parent: true,
      },
    });
    if (!category) return res.status(404).json({ error: 'Kategori bulunamadı.' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Kategori bilgileri alınamadı.' });
  }
});

// Get category by ID
categoriesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        children: { orderBy: { sortOrder: 'asc' } },
        attributes: { orderBy: { sortOrder: 'asc' } },
        parent: true,
      },
    });
    if (!category) return res.status(404).json({ error: 'Kategori bulunamadı.' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Kategori bilgileri alınamadı.' });
  }
});

// Create category (admin)
categoriesRouter.post('/', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { name, attributes, ...rest } = req.body;
    const slug = rest.slug || slugify(name);

    const category = await prisma.category.create({
      data: { name, slug, ...rest },
    });

    // Create attributes if provided
    if (attributes && Array.isArray(attributes)) {
      await prisma.categoryAttribute.createMany({
        data: attributes.map((attr: any, index: number) => ({
          ...attr,
          categoryId: category.id,
          sortOrder: attr.sortOrder ?? index,
        })),
      });
    }

    await createAuditLog({ userId: req.user!.id, action: 'CREATE_CATEGORY', entity: 'categories', entityId: category.id, ipAddress: req.ip });
    res.status(201).json(category);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Bu slug zaten mevcut.' });
    res.status(500).json({ error: 'Kategori oluşturulamadı.' });
  }
});

// Update category
categoriesRouter.put('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { attributes, ...data } = req.body;
    const category = await prisma.category.update({ where: { id: req.params.id }, data });

    if (attributes && Array.isArray(attributes)) {
      // Upsert attributes
      for (const attr of attributes) {
        if (attr.id) {
          await prisma.categoryAttribute.update({ where: { id: attr.id }, data: attr });
        } else {
          await prisma.categoryAttribute.create({
            data: { ...attr, categoryId: category.id },
          });
        }
      }
    }

    await createAuditLog({ userId: req.user!.id, action: 'UPDATE_CATEGORY', entity: 'categories', entityId: category.id, ipAddress: req.ip });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Kategori güncellenemedi.' });
  }
});

// Delete category (soft)
categoriesRouter.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    await prisma.category.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), isActive: false } });
    await createAuditLog({ userId: req.user!.id, action: 'DELETE_CATEGORY', entity: 'categories', entityId: req.params.id, ipAddress: req.ip });
    res.json({ message: 'Kategori silindi.' });
  } catch (error) {
    res.status(500).json({ error: 'Kategori silinemedi.' });
  }
});
