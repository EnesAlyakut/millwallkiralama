import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, apiError, validOrigin } from '@/lib/api-auth';

const schema = z.object({
  status: z.enum(['NEW', 'CALLED', 'CONTACTING', 'RESERVED', 'CANCELLED']),
  adminNote: z.string().max(2000).optional().nullable(),
  vehicleStatus: z.enum(['AVAILABLE', 'RENTED', 'RESERVED', 'MAINTENANCE', 'PASSIVE']).optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    if (!validOrigin(req)) return Response.json({ error: 'Geçersiz istek.' }, { status: 403 });

    const { id } = await params;
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'Geçersiz veri.' }, { status: 400 });

    const updatedReq = await db.rentalRequest.update({
      where: { id },
      data: { status: parsed.data.status, adminNote: parsed.data.adminNote || null },
    });

    if (parsed.data.vehicleStatus) {
      await db.vehicle.update({
        where: { id: updatedReq.vehicleId },
        data: { status: parsed.data.vehicleStatus },
      });
    }

    return Response.json(updatedReq);
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    if (!validOrigin(req)) return Response.json({ error: 'Geçersiz istek.' }, { status: 403 });
    const { id } = await params;
    await db.rentalRequest.update({ where: { id }, data: { deletedAt: new Date() } });
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
