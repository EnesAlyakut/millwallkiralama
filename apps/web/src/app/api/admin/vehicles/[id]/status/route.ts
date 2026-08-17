import { db } from '@/lib/db';
import { requireAdmin, apiError, validOrigin } from '@/lib/api-auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    if (!validOrigin(req)) return Response.json({ error: 'Geçersiz istek.' }, { status: 403 });

    const { id } = await params;
    const { status } = await req.json();

    const item = await db.vehicle.update({
      where: { id },
      data: { status },
    });

    return Response.json(item);
  } catch (e) {
    return apiError(e);
  }
}
