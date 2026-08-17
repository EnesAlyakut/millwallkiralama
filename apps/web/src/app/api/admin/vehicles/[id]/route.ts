import { db } from '@/lib/db';
import { requireAdmin, apiError, validOrigin } from '@/lib/api-auth';
import { vehicleSchema } from '@/lib/validation';
import { slugify } from '@/lib/site';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const item = await db.vehicle.findUnique({
      where: { id },
      include: { category: true, images: { orderBy: { sortOrder: 'asc' } } },
    });
    return item ? Response.json(item) : Response.json({ error: 'Araç bulunamadı.' }, { status: 404 });
  } catch (e) {
    return apiError(e);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    if (!validOrigin(req)) return Response.json({ error: 'Geçersiz istek.' }, { status: 403 });

    const { id } = await params;
    const raw = await req.json();
    const images: string[] = Array.isArray(raw.images)
      ? raw.images.filter((x: unknown) => typeof x === 'string')
      : [];
    raw.slug = raw.slug || slugify(raw.name || '');

    const parsed = vehicleSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const clash = await db.vehicle.findUnique({ where: { slug: parsed.data.slug } });
    if (clash && clash.id !== id) {
      return Response.json({ error: 'Bu URL slug başka bir araçta kullanılıyor.' }, { status: 400 });
    }

    const item = await db.vehicle.update({
      where: { id },
      data: {
        ...parsed.data,
        images: {
          deleteMany: {},
          create: images.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })),
        },
      },
    });

    return Response.json(item);
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    if (!validOrigin(req)) return Response.json({ error: 'Geçersiz istek.' }, { status: 403 });
    const { id } = await params;
    await db.vehicle.update({ where: { id }, data: { deletedAt: new Date(), status: 'PASSIVE' } });
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
