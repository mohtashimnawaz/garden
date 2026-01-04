const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn('[env-check] Missing env vars:', missing.join(', '));
  process.exitCode = 1;
} else {
  console.log('[env-check] All required env vars present.');
}
