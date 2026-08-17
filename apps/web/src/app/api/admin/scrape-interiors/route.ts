const https = require('https');
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import http from 'http';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'fleet');

async function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res: any) => {
      let data = '';
      res.on('data', (chunk: any) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res: any) => {
      let data = '';
      res.on('data', (chunk: any) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    }).on('error', reject);
  });
}

async function downloadImage(url: string, dest: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response: any) => {
      if (response.statusCode !== 200) {
        file.close();
        return resolve(false);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', () => {
      fs.unlink(dest, () => {});
      resolve(false);
    });
  });
}

export async function GET(req: Request) {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const vehicles = await db.vehicle.findMany({
      where: { deletedAt: null, status: { not: 'PASSIVE' } },
      select: { id: true, name: true, slug: true, interiorImages: true }
    });

    let updatedCount = 0;

    for (const v of vehicles) {
      try {
        const query = `${v.name} interior dashboard seats high quality`;
        const html = await fetchHtml(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`);
        const vqdMatch = html.match(/vqd=([\'\"])(.*?)\1/);
        
        if (!vqdMatch) continue;
        const vqd = vqdMatch[2];
        
        const ddgUrl = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&vqd=${vqd}&f=,,,&p=1`;
        const data = await fetchJson(ddgUrl);
        
        if (data && data.results && data.results.length > 0) {
          // Find first non-data valid image
          const result = data.results.find((r: any) => r.image && r.image.startsWith('http') && !r.image.includes('stock'));
          if (!result) continue;
          
          const imageUrl = result.image;
          const ext = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
          // Ensure valid extension
          const validExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext.toLowerCase()) ? ext : 'jpg';
          const destName = `${v.slug}-interior-scrape.${validExt}`;
          const destPath = path.join(UPLOADS_DIR, destName);
          
          const success = await downloadImage(imageUrl.replace(/^\/\//, 'https://'), destPath);
          
          if (success) {
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
            updatedCount++;
          }
        }
      } catch (e) {
        console.error(`Error scraping ${v.name}:`, e);
      }
      
      // Delay to avoid rate limits
      await new Promise(r => setTimeout(r, 1500));
    }

    return Response.json({ success: true, updatedCount });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
