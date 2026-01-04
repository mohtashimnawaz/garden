const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: any = null;

function makeStub() {
  return {
    auth: { getUser: async () => ({ data: { user: null } }) },
    from: (_: string) => ({ insert: async () => ({ error: new Error('Supabase not configured') }) }),
    channel: () => ({ on: () => ({ subscribe: () => {} }), subscribe: () => ({}) }),
    removeChannel: () => {}
  };
}

function initSupabase() {
  if (_client) return _client;
  console.log('initSupabase called — env:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
  console.trace('initSupabase stack trace');
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase env vars NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. Realtime and DB features are disabled.');
    _client = makeStub();
    return _client;
  }

  // Lazily require to avoid calling createClient during SSR module evaluation in some cases
  // where env vars may not be available yet.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient } = require('@supabase/supabase-js');
  console.log('creating real supabase client');
  _client = createClient(supabaseUrl, supabaseKey);
  return _client;
}

export const supabase = new Proxy({}, {
  get(_, prop) {
    const c = initSupabase();
    return (c as any)[prop];
  },
  apply(_, __, args) {
    const c = initSupabase();
    return (c as any).apply(null, args);
  }
});
