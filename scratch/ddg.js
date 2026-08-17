const https = require('https');

async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
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

async function search(query) {
  try {
    const html = await fetchHtml(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`);
    const vqdMatch = html.match(/vqd=([\'\"])(.*?)\1/);
    if (!vqdMatch) return console.log('No VQD token found');
    const vqd = vqdMatch[2];
    
    const url = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&vqd=${vqd}&f=,,,&p=1`;
    const data = await fetchJson(url);
    if (data && data.results) {
      console.log('Found:', data.results.slice(0,2).map(r => r.image));
    } else {
      console.log('No results.');
    }
  } catch (e) {
    console.error(e);
  }
}

search('Fiat Egea interior high quality');
