import { supabase } from '$lib/supabaseClient';

export async function POST({ request, cookies }) {
  const { email, password } = await request.json();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });

  cookies.set('sb-access-token', data.session.access_token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax'
  });

  cookies.set('sb-refresh-token', data.session.refresh_token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax'
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
