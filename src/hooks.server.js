import { createServerClient } from '@supabase/auth-helpers-sveltekit';

export const handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, {
              ...options,
              path: '/',
              sameSite: 'lax', // 👈 ważne dla network IP
              secure: false    // 👈 HTTP w DEV
            });
          });
        }
      }
    }
  );

  const {
    data: { session }
  } = await event.locals.supabase.auth.getSession();

  event.locals.session = session;

  return resolve(event);
};
