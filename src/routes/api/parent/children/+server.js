import { json } from '@sveltejs/kit';

/**
 * GET — lista dzieci zalogowanego rodzica
 */
export async function GET({ locals }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
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
    .order('created_at', { foreignTable: 'students', ascending: false });

  if (error) {
    console.error('GET parent children error:', error);
    return json({ error: error.message }, { status: 400 });
  }

  // spłaszczamy relację
  const children = (data || []).map(row => row.student);

  return json({ children }, { status: 200 });
}

/**
 * POST — dodanie dziecka przez rodzica
 */
export async function POST({ locals, request }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const { first_name, last_name, birth_date } = await request.json();

  if (!first_name || !last_name || !birth_date) {
    return json({ error: 'Brak wymaganych danych' }, { status: 400 });
  }

  /* --------------------------------------------------
   * 1️⃣ Tworzymy dziecko (students)
   * -------------------------------------------------- */
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

  /* --------------------------------------------------
   * 2️⃣ Tworzymy relację parent_student
   * -------------------------------------------------- */
  const { error: relationErr } = await supabase
    .from('parent_student')
    .insert({
      parent_id: user.id,
      student_id: student.id
    });

  if (relationErr) {
    console.error('Parent relation error:', relationErr);
    // nie cofamy studenta — relacja jest logiczna, nie krytyczna
  }

  return json({ child: student }, { status: 201 });
}
