import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  const supabase = locals.supabase;

  const session = locals.session;
  if (!session) throw redirect(303, '/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  return {
    role: profile?.role || null
  };
}
