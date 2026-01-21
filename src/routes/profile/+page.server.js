import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  const supabase = locals.supabase;

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) throw redirect(303, '/login');

  // role
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile) {
    return {
      role: null,
      weekClasses: []
    };
  }

  const role = profile.role;

  // default
  let weekClasses = [];

  /* --------------------------------------------------
   * STUDENT: zajęcia w tym tygodniu
   * -------------------------------------------------- */
  if (role === 'student') {
    // students.id
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (student?.id) {
      // classes dla grup studenta
      const { data: rows, error } = await supabase
        .from('student_groups')
        .select(`
          group:groups (
            id,
            name,
            classes (
              id,
              day_of_week,
              start_time,
              end_time,
              created_at
            )
          )
        `)
        .eq('student_id', student.id);

      if (!error && rows) {
        // spłaszczamy -> lista zajęć
        weekClasses = rows
          .flatMap((r) =>
            (r.group?.classes || []).map((c) => ({
              ...c,
              group: {
                id: r.group.id,
                name: r.group.name
              }
            }))
          )
          .sort((a, b) => {
            if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
            return String(a.start_time).localeCompare(String(b.start_time));
          });
      }
    }
  }

  return {
    role,
    weekClasses
  };
}
