import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  const supabase = locals.supabase;

  const session = locals.session;
  if (!session) {
    throw redirect(303, '/login');
  }

  const userId = session.user.id;

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profileErr || !profile?.role) {
    return { role: null, classes: [] };
  }

  const role = profile.role;
  if (role !== 'student') {
    return { role, classes: [] };
  }

  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('id')
    .eq('profile_id', userId)
    .single();

  if (studentErr || !student?.id) {
    return {
      role,
      classes: [],
      error: 'Brak rekordu student'
    };
  }

  const { data: sg, error: sgErr } = await supabase
    .from('student_groups')
    .select('group_id')
    .eq('student_id', student.id);

  if (sgErr) {
    return { role, classes: [], error: sgErr.message };
  }

  const groupIds = (sg || []).map((r) => r.group_id).filter(Boolean);

  if (groupIds.length === 0) {
    return { role, classes: [] };
  }

  const { data: classes, error: classesErr } = await supabase
    .from('classes')
    .select(`
      id,
      day_of_week,
      start_time,
      end_time,
      created_at,
      group_id:groups (
        id,
        name
      )
    `)
    .in('group_id', groupIds)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (classesErr) {
    return { role, classes: [], error: classesErr.message };
  }

  return {
    role,
    classes: classes || []
  };
}
  