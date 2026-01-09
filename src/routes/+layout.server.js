import { redirect } from '@sveltejs/kit';

export async function load({ locals, url }) {
  const session = locals.session;
  if (!session) return { session: null };

  const supabase = locals.supabase;
  const userId = session.user.id;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.role === 'student') {
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle();

    if (!student && url.pathname !== '/complete-profile') {
      throw redirect(303, '/complete-profile');
    }
  }

  return { session };
}
