import { Router, Request, Response } from 'express';
import { prisma } from '@kiralama/database';
import { authenticate, authorize } from '../middleware/auth';
import { createAuditLog } from '../services/auditService';
import { slugify } from '@kiralama/shared';

export const productsRouter = Router();

// List products (public) with filtering, search, pagination
productsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const {
      categoryId, categorySlug, branchId, search, status,
      minPrice, maxPrice, featured,
      page = '1', limit = '12', sort = 'createdAt', order = 'desc',
      startDate, endDate,
      ...dynamicFilters
    } = req.query;

    const where: any = { deletedAt: null };

    if (categoryId) where.categoryId = categoryId;
    if (categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug as string } });
      if (cat) {
        // Include sub-categories too
        const subCats = await prisma.category.findMany({ where: { parentId: cat.id } });
        const catIds = [cat.id, ...subCats.map(s => s.id)];
        where.categoryId = { in: catIds };
      }
    }
    if (branchId) where.branchId = branchId;
    if (status) where.status = status;
    if (featured === 'true') where.isFeatured = true;
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          branch: { select: { id: true, name: true, city: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 3 },
          pricingRules: { where: { isActive: true } },
          attributes: { include: { attribute: true } },
          _count: { select: { reviews: true, favorites: true } },
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { [sort as string]: order },
      }),
      prisma.product.count({ where }),
    ]);

    // Check availability if dates provided
    let availableProducts = products;
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      const unavailableProductIds = await prisma.availability.findMany({
        where: {
          status: { in: ['RESERVED', 'RENTED', 'MAINTENANCE'] },
          OR: [
            { startDate: { lte: end }, endDate: { gte: start } },
          ],
        },
        select: { productId: true },
        distinct: ['productId'],
      });

      const unavailableIds = new Set(unavailableProductIds.map(a => a.productId));
      availableProducts = products.filter(p => !unavailableIds.has(p.id));
    }

    res.json({
      products: availableProducts,
      total: startDate && endDate ? availableProducts.length : total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    console.error('Products list error:', error);
    res.status(500).json({ error: 'Ürünler listelenemedi.' });
  }
});

// Get product by slug (public)
productsRouter.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: { include: { parent: true, attributes: { orderBy: { sortOrder: 'asc' } } } },
        branch: true,
        images: { orderBy: { sortOrder: 'asc' } },
        pricingRules: { where: { isActive: true } },
        attributes: { include: { attribute: true } },
        reviews: {
          where: { isPublished: true },
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true, favorites: true } },
      },
    });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı.' });

    // Increment view count
    await prisma.product.update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } });

    // Get similar products
    const similar = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        deletedAt: null,
        status: 'AVAILABLE',
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        pricingRules: { where: { type: 'DAILY', isActive: true }, take: 1 },
      },
      take: 4,
    });

    res.json({ ...product, similar });
  } catch (error) {
    res.status(500).json({ error: 'Ürün bilgileri alınamadı.' });
  }
});

// Get product by ID
productsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: { include: { attributes: { orderBy: { sortOrder: 'asc' } } } },
        branch: true,
        images: { orderBy: { sortOrder: 'asc' } },
        pricingRules: { where: { isActive: true } },
        attributes: { include: { attribute: true } },
        availability: { where: { endDate: { gte: new Date() } }, orderBy: { startDate: 'asc' } },
        _count: { select: { reviews: true } },
      },
    });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı.' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Ürün bilgileri alınamadı.' });
  }
});

// Create product (admin)
productsRouter.post('/', authenticate, authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), async (req: Request, res: Response) => {
  try {
    const { attributes, pricingRules, images, ...data } = req.body;
    if (!data.slug) data.slug = slugify(data.name);

    const product = await prisma.product.create({ data });

    // Create attribute values
    if (attributes && Array.isArray(attributes)) {
      await prisma.productAttributeValue.createMany({
        data: attributes.map((attr: any) => ({
          productId: product.id,
          attributeId: attr.attributeId,
          value: attr.value,
        })),
      });
    }

    // Create pricing rules
    if (pricingRules && Array.isArray(pricingRules)) {
      await prisma.pricingRule.createMany({
        data: pricingRules.map((rule: any) => ({
          productId: product.id,
          type: rule.type,
          price: rule.price,
        })),
      });
    }

    await createAuditLog({ userId: req.user!.id, action: 'CREATE_PRODUCT', entity: 'products', entityId: product.id, ipAddress: req.ip });
    res.status(201).json(product);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Bu slug zaten mevcut.' });
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Ürün oluşturulamadı.' });
  }
});

// Update product
productsRouter.put('/:id', authenticate, authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), async (req: Request, res: Response) => {
  try {
    const { attributes, pricingRules, ...data } = req.body;
    const product = await prisma.product.update({ where: { id: req.params.id }, data });

    if (attributes && Array.isArray(attributes)) {
      for (const attr of attributes) {
        await prisma.productAttributeValue.upsert({
          where: { productId_attributeId: { productId: product.id, attributeId: attr.attributeId } },
          update: { value: attr.value },
          create: { productId: product.id, attributeId: attr.attributeId, value: attr.value },
        });
      }
    }

    if (pricingRules && Array.isArray(pricingRules)) {
      for (const rule of pricingRules) {
        if (rule.id) {
          await prisma.pricingRule.update({ where: { id: rule.id }, data: { price: rule.price, isActive: rule.isActive } });
        } else {
          await prisma.pricingRule.create({ data: { productId: product.id, type: rule.type, price: rule.price } });
        }
      }
    }

    await createAuditLog({ userId: req.user!.id, action: 'UPDATE_PRODUCT', entity: 'products', entityId: product.id, ipAddress: req.ip });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Ürün güncellenemedi.' });
  }
});

// Delete product (soft)
productsRouter.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
    await createAuditLog({ userId: req.user!.id, action: 'DELETE_PRODUCT', entity: 'products', entityId: req.params.id, ipAddress: req.ip });
    res.json({ message: 'Ürün silindi.' });
  } catch (error) {
    res.status(500).json({ error: 'Ürün silinemedi.' });
  }
});

// Calculate price
productsRouter.post('/calculate-price', async (req: Request, res: Response) => {
  try {
    const { productId, startDate, endDate, extras } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { pricingRules: { where: { isActive: true } } },
    });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı.' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const totalDays = Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 1);

    // Determine best price
    let dailyRate = 0;
    const dailyRule = product.pricingRules.find(r => r.type === 'DAILY');
    const weeklyRule = product.pricingRules.find(r => r.type === 'WEEKLY');
    const monthlyRule = product.pricingRules.find(r => r.type === 'MONTHLY');

    if (totalDays >= 30 && monthlyRule) {
      dailyRate = monthlyRule.price / 30;
    } else if (totalDays >= 7 && weeklyRule) {
      dailyRate = weeklyRule.price / 7;
    } else if (dailyRule) {
      dailyRate = dailyRule.price;
    }

    // Check seasonal pricing
    const seasonal = await prisma.seasonalPricing.findMany({
      where: {
        isActive: true,
        startDate: { lte: end },
        endDate: { gte: start },
        OR: [
          { productId: productId },
          { productId: null },
        ],
      },
    });

    if (seasonal.length > 0) {
      const bestSeasonal = seasonal[0];
      if (bestSeasonal.fixedPrice) {
        dailyRate = bestSeasonal.fixedPrice;
      } else {
        dailyRate = dailyRate * bestSeasonal.priceMultiplier;
      }
    }

    const subtotal = dailyRate * totalDays;

    // Calculate extras
    let extrasTotal = 0;
    const extraDetails: any[] = [];
    if (extras && Array.isArray(extras)) {
      for (const e of extras) {
        const extra = await prisma.extra.findUnique({ where: { id: e.extraId } });
        if (extra) {
          const qty = e.quantity || 1;
          let total = 0;
          if (extra.priceType === 'DAILY') total = extra.price * totalDays * qty;
          else if (extra.priceType === 'ONE_TIME') total = extra.price * qty;
          extrasTotal += total;
          extraDetails.push({ ...extra, quantity: qty, total });
        }
      }
    }

    const taxRate = 0.20; // From settings in production
    const taxAmount = (subtotal + extrasTotal) * taxRate;
    const totalAmount = subtotal + extrasTotal + taxAmount;

    res.json({
      totalDays,
      dailyRate: Math.round(dailyRate),
      subtotal: Math.round(subtotal),
      extras: extraDetails,
      extrasTotal: Math.round(extrasTotal),
      taxRate,
      taxAmount: Math.round(taxAmount),
      depositAmount: product.depositAmount,
      totalAmount: Math.round(totalAmount),
    });
  } catch (error) {
    console.error('Calculate price error:', error);
    res.status(500).json({ error: 'Fiyat hesaplanamadı.' });
  }
});
