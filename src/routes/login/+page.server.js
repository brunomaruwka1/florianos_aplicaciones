import { supabase } from '$lib/supabaseClient';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, cookies }) => {
    const body = await request.json();
    const { email, password } = body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return fail(400, { error: error.message });

    cookies.set('sb-access-token', data.session.access_token, { path: '/', httpOnly: true, sameSite: 'lax' });
    cookies.set('sb-refresh-token', data.session.refresh_token, { path: '/', httpOnly: true, sameSite: 'lax' });

    throw redirect(303, '/groups');
  }
};
