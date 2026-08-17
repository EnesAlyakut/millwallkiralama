import { PrismaClient } from './packages/database/node_modules/@prisma/client/index.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const db = new PrismaClient({ datasourceUrl: 'file:./packages/database/millwal.db' });
const UPLOADS_DIR = path.join(process.cwd(), 'apps/web/public/fleet');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function downloadImage(url: string, dest: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        return resolve(false);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      resolve(false);
    });
  });
}

async function run() {
  console.log('Starting Puppeteer for image scraping...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const vehicles = await db.vehicle.findMany({
    where: { deletedAt: null, status: { not: 'PASSIVE' } },
    select: { id: true, name: true, slug: true, interiorImages: true }
  });

  console.log(`Found ${vehicles.length} vehicles.`);

  for (const v of vehicles) {
    try {
      console.log(`Searching interior for ${v.name}...`);
      const query = encodeURIComponent(`${v.name} interior high quality`);
      await page.goto(`https://duckduckgo.com/?q=${query}&t=h_&iar=images&iax=images&ia=images`, { waitUntil: 'networkidle2' });
      
      // Wait for images to load
      await page.waitForSelector('.tile--img__img', { timeout: 10000 }).catch(() => {});
      
      const imageUrl = await page.evaluate(() => {
        const img = document.querySelector('.tile--img__img');
        return img ? (img as HTMLImageElement).src : null;
      });

      if (!imageUrl || imageUrl.startsWith('data:')) {
        console.log(`- No valid image found for ${v.name}.`);
        continue;
      }

      console.log(`- Found image for ${v.name}, downloading...`);
      const ext = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const destName = `${v.slug}-interior-web.${ext}`;
      const destPath = path.join(UPLOADS_DIR, destName);
      
      const success = await downloadImage(imageUrl.replace(/^\/\//, 'https://'), destPath);
      
      if (success) {
        // Append to existing interiorImages if they exist
        let currentImages = [];
        if (v.interiorImages) {
          try { currentImages = JSON.parse(v.interiorImages); } catch (e) {}
        }
        if (!currentImages.includes(`/fleet/${destName}`)) {
          currentImages.push(`/fleet/${destName}`);
        }
        
        await db.vehicle.update({
          where: { id: v.id },
          data: { interiorImages: JSON.stringify(currentImages) }
        });
        console.log(`- Successfully updated ${v.name}!`);
      }
    } catch (e) {
      console.error(`Error scraping ${v.name}:`, e);
    }
  }

  await browser.close();
  console.log('Done!');
}

run().catch(console.error).finally(() => db.$disconnect());
