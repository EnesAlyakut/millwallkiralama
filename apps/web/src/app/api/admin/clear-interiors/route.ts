import { db } from '@/lib/db';

export async function GET() {
  try {
    await db.vehicle.updateMany({
      data: { interiorImages: null }
    });
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
