import { db } from '@/lib/db';
import { requireAdmin, apiError, validOrigin } from '@/lib/api-auth';
import { categorySchema } from '@/lib/validation';
import { slugify } from '@/lib/site';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    if (!validOrigin(req)) return Response.json({ error: 'Geçersiz istek.' }, { status: 403 });

    const { id } = await params;
    const raw = await req.json();
    raw.slug = raw.slug || slugify(raw.name || '');

    const parsed = categorySchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const clash = await db.category.findUnique({ where: { slug: parsed.data.slug } });
    if (clash && clash.id !== id) {
      return Response.json({ error: 'Bu slug başka bir kategoride kullanılıyor.' }, { status: 400 });
    }

    return Response.json(await db.category.update({ where: { id }, data: parsed.data }));
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    if (!validOrigin(req)) return Response.json({ error: 'Geçersiz istek.' }, { status: 403 });

    const { id } = await params;
    const count = await db.vehicle.count({ where: { categoryId: id, deletedAt: null } });
    if (count > 0) {
      return Response.json(
        { error: `Bu kategoride ${count} araç bulunuyor. Önce araçları taşıyın veya silin.` },
        { status: 400 },
      );
    }

    await db.category.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
