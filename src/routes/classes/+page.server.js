import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  const supabase = locals.supabase;

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) throw redirect(303, '/login');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return {
      role: null
    };
  }

  return {
    role: profile.role
  };
}
