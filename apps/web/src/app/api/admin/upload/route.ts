export const runtime = 'nodejs';

import { requireAdmin, apiError, validOrigin } from '@/lib/api-auth';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const allowed = new Map([
  ['image/jpeg', { ext: 'jpg', max: 5 * 1024 * 1024 }],
  ['image/png', { ext: 'png', max: 5 * 1024 * 1024 }],
  ['image/webp', { ext: 'webp', max: 5 * 1024 * 1024 }],
  ['video/mp4', { ext: 'mp4', max: 80 * 1024 * 1024 }],
  ['video/webm', { ext: 'webm', max: 80 * 1024 * 1024 }],
]);

export async function POST(req: Request) {
  try {
    await requireAdmin();
    if (!validOrigin(req)) return Response.json({ error: 'Geçersiz istek.' }, { status: 403 });

    const form = await req.formData();
    const files = form.getAll('files').filter((file): file is File => file instanceof File);
    if (!files.length) return Response.json({ error: 'Dosya seçilmedi.' }, { status: 400 });

    const dir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(dir, { recursive: true });
    const urls: string[] = [];

    for (const file of files) {
      const rule = allowed.get(file.type);
      if (!rule || file.size > rule.max) {
        return Response.json(
          { error: 'JPG, PNG ve WebP en fazla 5 MB; MP4 ve WebM en fazla 80 MB olabilir.' },
          { status: 400 },
        );
      }
      const name = `${randomUUID()}.${rule.ext}`;
      await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
      urls.push(`/uploads/${name}`);
    }

    return Response.json({ urls });
  } catch (error) {
    return apiError(error);
  }
}
