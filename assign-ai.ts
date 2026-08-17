import { PrismaClient } from './packages/database/node_modules/@prisma/client/index.js';
import fs from 'fs';
import path from 'path';

// Just use the standard initialization from packages/database/prisma
const db = new PrismaClient({ datasourceUrl: 'file:./packages/database/prisma/dev.db' }); // or millwal.db, we'll try dev.db

const ARTIFACTS_DIR = 'C:\\Users\\enesa\\.gemini\\antigravity-ide\\brain\\d89e9c87-2f6c-4403-b12e-7950f1144230';
const UPLOADS_DIR = path.join(__dirname, 'apps/web/public/fleet');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const mapping = [
  { slug: 'fiat-egea', ext: 'fiat_egea_exterior_1786980465505.jpg', int: 'generic_sedan_interior_1786980540104.jpg' },
  { slug: 'renault-clio', ext: 'renault_clio_exterior_1786980479759.jpg', int: 'generic_hatchback_interior_1786980556949.jpg' },
  { slug: 'hyundai-i20', ext: 'hyundai_i20_exterior_1786980492313.jpg', int: 'generic_hatchback_interior_1786980556949.jpg' },
  { slug: 'renault-megane', ext: 'renault_megane_exterior_1786980504349.jpg', int: 'generic_sedan_interior_1786980540104.jpg' },
  { slug: 'toyota-corolla', ext: 'toyota_corolla_exterior_1786980515781.jpg', int: 'generic_sedan_interior_1786980540104.jpg' },
  { slug: 'volkswagen-passat', ext: 'vw_passat_exterior_1786980586887.jpg', int: 'generic_sedan_interior_1786980540104.jpg' },
  { slug: 'audi-a4', ext: 'audi_a4_exterior_1786980597540.jpg', int: 'generic_sedan_interior_1786980540104.jpg' },
  { slug: 'bmw-320i', ext: 'bmw_320i_exterior_1786980607916.jpg', int: 'generic_sedan_interior_1786980540104.jpg' },
  { slug: 'mercedes-benz-e-200', ext: 'mercedes_e200_exterior_1786980619941.jpg', int: 'generic_sedan_interior_1786980540104.jpg' },
  { slug: 'tesla-model-3', ext: 'tesla_model3_exterior_1786980632356.jpg', int: 'generic_sedan_interior_1786980540104.jpg' },
  { slug: 'fiat-doblo', ext: 'generic_van_exterior_1786980708626.jpg', int: null },
  { slug: 'ford-transit-custom', ext: 'generic_van_exterior_1786980708626.jpg', int: null },
  { slug: 'ford-transit-jumbo', ext: 'generic_van_exterior_1786980708626.jpg', int: null },
  { slug: 'mercedes-benz-sprinter', ext: 'generic_van_exterior_1786980708626.jpg', int: null }
];

async function run() {
  console.log('Starting image assignment...');
  for (const item of mapping) {
    const vehicle = await db.vehicle.findUnique({ where: { slug: item.slug } });
    if (!vehicle) {
      console.log('Vehicle not found:', item.slug);
      continue;
    }

    const extDest = item.slug + '-ext.jpg';
    fs.copyFileSync(path.join(ARTIFACTS_DIR, item.ext), path.join(UPLOADS_DIR, extDest));

    let intDest = null;
    if (item.int) {
      intDest = item.slug + '-int.jpg';
      fs.copyFileSync(path.join(ARTIFACTS_DIR, item.int), path.join(UPLOADS_DIR, intDest));
    }

    await db.vehicle.update({
      where: { id: vehicle.id },
      data: {
        mainImage: '/fleet/' + extDest,
        interiorImages: intDest ? JSON.stringify(['/fleet/' + intDest]) : null
      }
    });

    console.log(`Updated ${vehicle.name} with AI images.`);
  }

  console.log('Done!');
}

run().catch(console.error).finally(() => db.$disconnect());
