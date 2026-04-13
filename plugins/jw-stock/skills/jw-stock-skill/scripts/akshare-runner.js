import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, '..', 'scripts', 'akshare_hist.py');

export async function fetchHistory(market, code, startDate, endDate) {
  return new Promise((resolve, reject) => {
    const py = spawn('python3', [SCRIPT, market, code, startDate, endDate], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    let err = '';
    py.stdout.on('data', (d) => { out += d.toString(); });
    py.stderr.on('data', (d) => { err += d.toString(); });
    py.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(err || `akshare exited ${code}`));
        return;
      }
      try {
        const data = JSON.parse(out);
        resolve(data);
      } catch (e) {
        reject(new Error(`akshare invalid json: ${out.slice(0, 200)}`));
      }
    });
    py.on('error', reject);
  });
}

export function marketToAkshare(market) {
  if (market === '港股') return 'hk';
  if (market === 'A 股') return 'a_stock';
  return null;
}
