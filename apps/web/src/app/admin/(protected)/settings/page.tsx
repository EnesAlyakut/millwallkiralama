import { db } from '@/lib/db';
import SettingsForm from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const settings = await db.settings.findUnique({ where: { id: 1 } });

  return (
    <div className="admin-page">
      <div className="admin-title">
        <div>
          <span>AYARLAR</span>
          <h1>Site Ayarları</h1>
        </div>
      </div>
      <SettingsForm initial={JSON.parse(JSON.stringify(settings || {}))} />
    </div>
  );
}
