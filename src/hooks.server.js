import { createServerClient } from '@supabase/auth-helpers-sveltekit';

export const handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => event.cookies.get(key),
        set: (key, value, options) => event.cookies.set(key, value, { ...options, path: '/' }),
        remove: (key, options) => event.cookies.delete(key, { ...options, path: '/' })
      }
    }
  );

  const {
    data: { session }
  } = await event.locals.supabase.auth.getSession();

  event.locals.session = session;

  return resolve(event);
};
