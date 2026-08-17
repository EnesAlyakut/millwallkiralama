import { db } from '@/lib/db';
import { requireAdmin, apiError, validOrigin } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const q = new URL(req.url).searchParams;
    const page = Math.max(1, Number(q.get('page')) || 1);
    const where: any = { deletedAt: null };
    if (q.get('status')) where.status = q.get('status');
    const [items, total] = await Promise.all([
      db.rentalRequest.findMany({
        where,
        include: { vehicle: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * 25,
        take: 25,
      }),
      db.rentalRequest.count({ where }),
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

    const data = await req.json();
    if (!data.vehicleId || !data.fullName || !data.phone) {
      return Response.json({ error: 'Araç, müşteri adı ve telefon zorunludur.' }, { status: 400 });
    }

    const result = await db.$transaction(async (tx) => {
      const created = await tx.rentalRequest.create({
        data: {
          vehicleId: data.vehicleId,
          fullName: data.fullName,
          phone: data.phone,
          status: data.status || 'NEW',
          adminNote: data.adminNote || null,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          message: data.message || null,
        },
        include: { vehicle: { select: { id: true, name: true, slug: true, status: true } } },
      });

      if (data.vehicleStatus) {
        await tx.vehicle.update({
          where: { id: data.vehicleId },
          data: { status: data.vehicleStatus },
        });
        created.vehicle.status = data.vehicleStatus;
      }

      return created;
    });

    return Response.json(result);
  } catch (e) {
    return apiError(e);
  }
}
