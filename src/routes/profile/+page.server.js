import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  const supabase = locals.supabase;

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) throw redirect(303, '/login');

  // =========================
  // ROLA
  // =========================
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile) {
    return {
      role: null,
      todayClasses: []
    };
  }

  const role = profile.role;

  // =========================
  // DZISIAJ → day_of_week
  // =========================
  const jsDay = new Date().getDay(); // 0 = niedziela
  const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // 0 = poniedziałek

  let todayClasses = [];

  // =====================================================
  // TRENER – wszystkie swoje zajęcia dziś
  // =====================================================
  if (role === 'trainer') {
    const { data } = await supabase
      .from('classes')
      .select(`
        id,
        start_time,
        end_time,
        group:groups (
          id,
          name
        )
      `)
      .eq('day_of_week', dayOfWeek)
      .order('start_time', { ascending: true });

    todayClasses = (data || []).map((c) => ({
      ...c,
      canOpenSession: true
    }));
  }

  // =====================================================
  // STUDENT – zajęcia jego grup dziś
  // =====================================================
  if (role === 'student') {
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (student?.id) {
      const { data: rows } = await supabase
        .from('student_groups')
        .select(`
          group:groups (
            id,
            name,
            classes (
              id,
              day_of_week,
              start_time,
              end_time
            )
          )
        `)
        .eq('student_id', student.id);

      todayClasses = (rows || [])
        .flatMap((r) =>
          (r.group?.classes || [])
            .filter((c) => c.day_of_week === dayOfWeek)
            .map((c) => ({
              ...c,
              group: {
                id: r.group.id,
                name: r.group.name
              },
              canOpenSession: false
            }))
        )
        .sort((a, b) =>
          String(a.start_time).localeCompare(String(b.start_time))
        );
    }
  }

  // =====================================================
  // RODZIC – zajęcia dzieci dziś
  // =====================================================
  if (role === 'parent') {
    const { data: links } = await supabase
      .from('parent_student')
      .select('student_id')
      .eq('parent_id', user.id);

    const studentIds = (links || []).map((l) => l.student_id);

    if (studentIds.length > 0) {
      const { data: rows } = await supabase
        .from('student_groups')
        .select(`
          student_id,
          group:groups (
            id,
            name,
            classes (
              id,
              day_of_week,
              start_time,
              end_time
            )
          )
        `)
        .in('student_id', studentIds);

      todayClasses = (rows || [])
        .flatMap((r) =>
          (r.group?.classes || [])
            .filter((c) => c.day_of_week === dayOfWeek)
            .map((c) => ({
              ...c,
              group: {
                id: r.group.id,
                name: r.group.name
              },
              canOpenSession: false
            }))
        )
        .sort((a, b) =>
          String(a.start_time).localeCompare(String(b.start_time))
        );
    }
  }

  return {
    role,
    todayClasses
  };
}
