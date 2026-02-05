import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  const supabase = locals.supabase;

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) {
    throw redirect(303, '/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'parent') {
    throw redirect(303, '/profile');
  }

  const { data, error } = await supabase
    .from('parent_student')
    .select(`
      student:students (
        id,
        first_name,
        last_name,
        birth_date,
        created_at
      )
    `)
    .eq('parent_id', user.id)
    .order('created_at', {
      foreignTable: 'students',
      ascending: false
    });

  if (error) {
    console.error('LOAD parent children error:', error);
    return {
      children: []
    };
  }

  const children = (data || [])
    .map(row => row.student)
    .filter(Boolean);

  return {
    children
  };
}
