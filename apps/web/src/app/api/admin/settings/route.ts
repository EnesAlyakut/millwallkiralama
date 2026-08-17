import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, apiError, validOrigin } from '@/lib/api-auth';

const opt = z.string().optional();

const schema = z.object({
  siteName: z.string().min(2),
  companyLegalName: z.string().min(3),
  phone: z.string().min(10),
  phoneSecondary: opt,
  whatsapp: z.string().min(10),
  email: z.string().email(),
  address: z.string().min(5),
  mersisNo: z.string(),
  tradeRegistryNo: z.string(),
  tradeRegistryOffice: z.string(),
  taxOffice: opt,
  taxNumber: opt,
  googleMapsUrl: opt,
  instagramUrl: opt,
  facebookUrl: opt,
  linkedinUrl: opt,
  tiktokUrl: opt,
  youtubeUrl: opt,
  workingHours: opt,
  workingHoursWeekend: opt,
  logoUrl: opt,
  faviconUrl: opt,
  footerDescription: opt,
  seoTitle: opt,
  seoDescription: opt,
  campaignEnabled: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === 'true' || v === 'on'),
  campaignTitle: opt,
  campaignText: opt,
  campaignImageUrl: opt,
  campaignButtonText: opt,
});

export async function GET() {
  try {
    await requireAdmin();
    return Response.json(await db.settings.findUnique({ where: { id: 1 } }));
  } catch (e) {
    return apiError(e);
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    if (!validOrigin(req)) return Response.json({ error: 'Geçersiz istek.' }, { status: 403 });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    return Response.json(await db.settings.update({ where: { id: 1 }, data: parsed.data }));
  } catch (e) {
    return apiError(e);
  }
}
