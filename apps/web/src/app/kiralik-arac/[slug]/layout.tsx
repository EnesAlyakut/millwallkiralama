import { db } from '@/lib/db';
import ViewTracker from '@/components/ViewTracker';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const v = await db.vehicle.findFirst({ where: { slug, deletedAt: null }, select: { id: true } });

  return (
    <>
      {children}
      {v && <ViewTracker id={v.id} />}
    </>
  );
}
