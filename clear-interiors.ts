import { PrismaClient } from './packages/database/node_modules/@prisma/client/index.js';
const db = new PrismaClient({ datasourceUrl: 'file:./packages/database/millwal.db' });

async function run() {
  console.log('Clearing interior images...');
  await db.vehicle.updateMany({
    data: { interiorImages: null }
  });
  console.log('Cleared!');
}
run().catch(console.error).finally(() => db.$disconnect());
