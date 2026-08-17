import type { Prisma } from '@kiralama/database';
import { db } from '@/lib/db';
import { requireAdmin, apiError, validOrigin } from '@/lib/api-auth';
import { vehicleSchema } from '@/lib/validation';
import { slugify } from '@/lib/site';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const q = new URL(req.url).searchParams;
    const page = Math.max(1, Number(q.get('page')) || 1);

    const where: Prisma.VehicleWhereInput = { deletedAt: null };
    const status = q.get('status');
    const categoryId = q.get('categoryId');
    const search = q.get('search');
    if (status) where.status = status as Prisma.VehicleWhereInput['status'];
    if (categoryId) where.categoryId = categoryId;
    if (search) where.OR = [{ name: { contains: search } }, { brand: { contains: search } }];

    const [items, total] = await Promise.all([
      db.vehicle.findMany({
        where,
        include: { category: true },
        skip: (page - 1) * 20,
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
      db.vehicle.count({ where }),
    ]);

    return Response.json({ items, total, page });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    if (!validOrigin(req)) return Response.json({ error: 'Geçersiz istek.' }, { status: 403 });

    const raw = await req.json();
    const images: string[] = Array.isArray(raw.images)
      ? raw.images.filter((x: unknown) => typeof x === 'string')
      : [];
    raw.slug = raw.slug || slugify(raw.name || '');

    const parsed = vehicleSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    let slug = parsed.data.slug;
    let n = 2;
    while (await db.vehicle.findUnique({ where: { slug } })) slug = `${parsed.data.slug}-${n++}`;

    const item = await db.vehicle.create({
      data: {
        ...parsed.data,
        slug,
        images: { create: images.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })) },
      },
    });

    return Response.json(item, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
