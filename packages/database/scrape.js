import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const db = new PrismaClient(); // It will use dev.db from its own .env
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../../apps/web/public/fleet');

async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    }).on('error', reject);
  });
}

async function downloadImage(url, dest) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      if (response.statusCode !== 200) { file.close(); return resolve(false); }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    }).on('error', () => { fs.unlink(dest, () => {}); resolve(false); });
  });
}

async function run() {
  const vehicles = await db.vehicle.findMany({
    where: { deletedAt: null, status: { not: 'PASSIVE' } }
  });

  for (const v of vehicles) {
    let updated = false;
    let dataToUpdate = {};
    console.log(`Scraping ${v.name}...`);

    // 1. Exterior image (mainImage)
    if (!v.mainImage || v.mainImage === '') {
      try {
        const query = `${v.name} exterior high quality 2024`;
        const html = await fetchHtml(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`);
        const vqdMatch = html.match(/vqd=([\'\"])(.*?)\1/);
        
        if (vqdMatch) {
          const ddgUrl = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&vqd=${vqdMatch[2]}&f=,,,&p=1`;
          const data = await fetchJson(ddgUrl);
          
          if (data && data.results && data.results.length > 0) {
            const result = data.results.find(r => r.image && r.image.startsWith('http') && !r.image.includes('stock'));
            if (result) {
              const ext = result.image.split('.').pop().split('?')[0] || 'jpg';
              const validExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext.toLowerCase()) ? ext : 'jpg';
              const destName = `${v.slug}-exterior-scrape.${validExt}`;
              const destPath = path.join(UPLOADS_DIR, destName);
              
              if (await downloadImage(result.image.replace(/^\/\//, 'https://'), destPath)) {
                dataToUpdate.mainImage = `/fleet/${destName}`;
                updated = true;
                console.log(` -> Found exterior`);
              }
            }
          }
        }
      } catch (e) {
        console.error('Exterior scrape failed', e.message);
      }
    }

    // 2. Interior image (interiorImages)
    let hasInterior = false;
    if (v.interiorImages) {
        try { hasInterior = JSON.parse(v.interiorImages).length > 0; } catch (e) {}
    }
    
    if (!hasInterior) {
      try {
        const query = `${v.name} interior dashboard seats high quality`;
        const html = await fetchHtml(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`);
        const vqdMatch = html.match(/vqd=([\'\"])(.*?)\1/);
        
        if (vqdMatch) {
          const ddgUrl = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&vqd=${vqdMatch[2]}&f=,,,&p=1`;
          const data = await fetchJson(ddgUrl);
          
          if (data && data.results && data.results.length > 0) {
            const result = data.results.find(r => r.image && r.image.startsWith('http') && !r.image.includes('stock'));
            if (result) {
              const ext = result.image.split('.').pop().split('?')[0] || 'jpg';
              const validExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext.toLowerCase()) ? ext : 'jpg';
              const destName = `${v.slug}-interior-scrape.${validExt}`;
              const destPath = path.join(UPLOADS_DIR, destName);
              
              if (await downloadImage(result.image.replace(/^\/\//, 'https://'), destPath)) {
                dataToUpdate.interiorImages = JSON.stringify([`/fleet/${destName}`]);
                updated = true;
                console.log(` -> Found interior`);
              }
            }
          }
        }
      } catch (e) {
        console.error('Interior scrape failed', e.message);
      }
    }

    if (updated) {
      await db.vehicle.update({ where: { id: v.id }, data: dataToUpdate });
      console.log(`Saved ${v.name} to DB.`);
    }
    
    await new Promise(r => setTimeout(r, 1000));
  }
}

run().catch(console.error).finally(() => db.$disconnect());
