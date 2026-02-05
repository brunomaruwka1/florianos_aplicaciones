import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  const supabase = locals.supabase;

  const session = locals.session;
  if (!session) throw redirect(303, '/login');

  const userId = session.user.id;

  // 1) role
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profileErr || !profile) {
    console.error('Profile fetch error:', profileErr);
    return {
      role: null,
      groups: []
    };
  }

  const role = profile.role;
  let groups = [];

  /* --------------------------------------------------
   * 2) TRAINER GROUPS
   * -------------------------------------------------- */
  if (role === 'trainer') {
    const { data, error } = await supabase
      .from('group_trainers')
      .select('group:groups(id, name, description, created_at)')
      .eq('trainer_id', userId)
      .order('created_at', { foreignTable: 'groups', ascending: false });

    if (error) {
      console.error('Trainer groups fetch error:', error);
      groups = [];
    } else {
        groups = (data || [])
        .map((row) => row.group)
        .filter(Boolean);
    }
  }

  /* --------------------------------------------------
   * 3) STUDENT GROUPS
   * -------------------------------------------------- */
  if (role === 'student') {
    // student id
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', userId)
      .single();

    if (studentErr || !student) {
      console.error('Student fetch error:', studentErr);
      groups = [];
    } else {
      const { data, error } = await supabase
        .from('student_groups')
        .select('group:groups(id, name, description, created_at)')
        .eq('student_id', student.id)
        .order('created_at', { foreignTable: 'groups', ascending: false });

      if (error) {
        console.error('Student groups fetch error:', error);
        groups = [];
      } else {
        groups = (data || [])
          .map((row) => row.group)
          .filter(Boolean);
      }
    }
  }

  return {
    role,
    groups
  };
}
