import { json } from '@sveltejs/kit';

/**
 * GET
 * - trainer → lista studentów powiązanych przez trainer_student
 * - parent → lista studentów utworzonych przez rodzica (created_by)
 */
export async function GET({ locals }) {
  const supabase = locals.supabase;

  // ✅ auth
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  // ✅ role
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile?.role) {
    return json({ error: 'Brak profilu/roli użytkownika' }, { status: 400 });
  }

  /* --------------------------------------------------
   * ✅ TRAINER → trainer_student join students
   * -------------------------------------------------- */
  if (profile.role === 'trainer') {
    const { data, error } = await supabase
      .from('trainer_student')
      .select(`
        student:students (
          id,
          first_name,
          last_name,
          birth_date,
          created_at
        )
      `)
      .eq('trainer_id', user.id)
      .order('created_at', { foreignTable: 'students', ascending: false });

    if (error) {
      console.error('GET trainer students error:', error);
      return json({ error: error.message }, { status: 400 });
    }

    const students = (data || [])
      .map((row) => row.student)
      .filter(Boolean);

    return json({ students }, { status: 200 });
  }

  /* --------------------------------------------------
   * ✅ PARENT → created_by
   * -------------------------------------------------- */
  if (profile.role === 'parent') {
    const { data, error } = await supabase
      .from('students')
      .select('id, first_name, last_name, birth_date, created_at')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET parent students error:', error);
      return json({ error: error.message }, { status: 400 });
    }

    return json({ students: data || [] }, { status: 200 });
  }

  // student nie ma endpointu "students list"
  return json({ students: [] }, { status: 200 });
}

/**
 * POST — dodanie studenta
 * - parent → tylko student
 * - trainer → student + relacja trainer_student (ZAWSZE)
 */
export async function POST({ locals, request }) {
  const supabase = locals.supabase;

  // ✅ auth
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  // ✅ rola
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile?.role) {
    return json({ error: 'Brak profilu/roli użytkownika' }, { status: 400 });
  }

  const { first_name, last_name, birth_date } = await request.json();

  if (!first_name || !last_name || !birth_date) {
    return json({ error: 'Brak wymaganych danych' }, { status: 400 });
  }

  // 1️⃣ student
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .insert({
      first_name,
      last_name,
      birth_date,
      created_by: user.id
    })
    .select()
    .single();

  if (studentErr) {
    console.error('Student insert error:', studentErr);
    return json({ error: studentErr.message }, { status: 400 });
  }

  // 2️⃣ jeśli trener -> relacja trainer_student
  if (profile.role === 'trainer') {
    const { error: relationErr } = await supabase
      .from('trainer_student')
      .upsert(
        {
          trainer_id: user.id, // ✅ profiles.id
          student_id: student.id
        },
        { onConflict: 'trainer_id,student_id' }
      );

    if (relationErr) {
      console.error('trainer_student upsert error:', relationErr);
      return json(
        {
          error:
            'Student dodany, ale nie udało się utworzyć relacji trener–student: ' +
            relationErr.message
        },
        { status: 400 }
      );
    }
  }

  return json({ student }, { status: 201 });
}
