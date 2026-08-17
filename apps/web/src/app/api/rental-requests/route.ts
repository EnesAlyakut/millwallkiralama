import { db } from '@/lib/db';
import { rentalRequestSchema } from '@/lib/validation';

const attempts = new Map<string, { count: number; reset: number }>();

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
    const now = Date.now();
    const record = attempts.get(ip);

    if (record && record.reset > now && record.count >= 5) {
      return Response.json(
        { error: 'Çok fazla talep gönderildi. Lütfen bir süre sonra tekrar deneyin.' },
        { status: 429 },
      );
    }

    const parsed = rentalRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message || 'Form bilgileri geçersiz.' },
        { status: 400 },
      );
    }

    if (parsed.data.website) {
      return Response.json({ message: 'Talebiniz alınmıştır.' }, { status: 201 });
    }

    const vehicle = await db.vehicle.findFirst({
      where: { id: parsed.data.vehicleId, deletedAt: null, status: { not: 'PASSIVE' } },
    });
    if (!vehicle) return Response.json({ error: 'Araç bulunamadı.' }, { status: 404 });

    attempts.set(ip, {
      count: record && record.reset > now ? record.count + 1 : 1,
      reset: now + 15 * 60_000,
    });

    const d = parsed.data;
    await db.rentalRequest.create({
      data: {
        vehicleId: d.vehicleId,
        fullName: d.fullName,
        phone: d.phone,
        email: d.email || null,
        company: d.company || null,
        startDate: d.startDate ? new Date(d.startDate) : null,
        endDate: d.endDate ? new Date(d.endDate) : null,
        pickupLocation: d.pickupLocation || null,
        dropoffLocation: d.dropoffLocation || null,
        message: d.message || null,
      },
    });

    return Response.json(
      { message: 'Talebiniz alınmıştır. Ekibimiz en kısa sürede sizinle iletişime geçecektir.' },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { error: 'Talep gönderilemedi. Lütfen telefon veya WhatsApp ile ulaşın.' },
      { status: 500 },
    );
  }
}
