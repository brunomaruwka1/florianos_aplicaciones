import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  const supabase = locals.supabase;

  const session = locals.session;
  if (!session) throw redirect(303, '/login');

  const userId = session.user.id;

  // ✅ role
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profileErr || !profile?.role) {
    console.error('Profile fetch error:', profileErr);
    return {
      role: null,
      student: null,
      studentGroupsRaw: [],
      groups: []
    };
  }

  const role = profile.role;

  if (role !== 'student') {
    throw redirect(303, '/groups');
  }

  // ✅ students.id
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('id, first_name, last_name')
    .eq('profile_id', userId)
    .single();

  if (studentErr || !student) {
    console.error('Student fetch error:', studentErr);
    return {
      role,
      student: null,
      studentGroupsRaw: [],
      groups: []
    };
  }

  // ✅ student_groups records (dopasowane do Twojej tabeli)
  const { data: studentGroupsRaw, error: sgErr } = await supabase
    .from('student_groups')
    .select(`
      student_id,
      group_id,
      joined_at,
      group:groups(
        id,
        name,
        description,
        created_at
      )
    `)
    .eq('student_id', student.id)
    .order('joined_at', { ascending: false });

  if (sgErr) {
    console.error('Student groups fetch error:', sgErr);

    return {
      role,
      student,
      studentGroupsRaw: [],
      groups: []
    };
  }

  const groups = (studentGroupsRaw || [])
    .map((row) => row.group)
    .filter(Boolean);

  return {
    role,
    student,
    studentGroupsRaw: studentGroupsRaw || [],
    groups
  };
}
    