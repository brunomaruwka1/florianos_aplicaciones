// src/routes/messages/+page.server.js
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  const supabase = locals.supabase;

  // ✅ auth bezpiecznie
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    throw redirect(303, '/login');
  }

  // role
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr) {
    // nie blokujemy strony - po prostu brak roli
    return { role: null };
  }

  return {
    role: profile?.role || null
  };
}
