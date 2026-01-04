const fs = require('fs');
try { require('dotenv').config(); } catch (e) { /* dotenv not installed */ }
const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
let missing = required.filter((k) => !process.env[k]);
// If missing, try to read .env.local directly (useful in dev)
if (missing.length) {
  try {
    const txt = fs.readFileSync('.env.local', 'utf8');
    txt.split(/\n/).forEach((l) => {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/i);
      if (m) process.env[m[1]] = (m[2] || '').replace(/\r$/, '').replace(/^\"|\"$/g, '');
    });
  } catch (e) {
    // ignore if file missing
  }
  missing = required.filter((k) => !process.env[k]);
}
if (missing.length) {
  console.warn('[env-check] Missing env vars:', missing.join(', '));
  process.exitCode = 1;
} else {
  console.log('[env-check] All required env vars present.');
}
