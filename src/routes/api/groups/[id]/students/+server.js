import { json } from '@sveltejs/kit';

export async function POST({ params, locals, request }) {
  const supabase = locals.supabase;
  const groupId = params.id;

  // 🔐 sprawdzenie auth
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const body = await request.json();
  const { first_name, last_name, birth_date } = body;

  if (!first_name || !last_name || !birth_date) {
    return json({ error: 'Brak wymaganych danych' }, { status: 400 });
  }

  // 1️⃣ tworzymy studenta
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .insert({
      first_name,
      last_name,
      birth_date
    })
    .select()
    .single();

  if (studentErr) {
    return json({ error: studentErr.message }, { status: 400 });
  }

  // 2️⃣ przypisujemy do grupy
  const { error: sgErr } = await supabase
    .from('student_groups')
    .insert({
      student_id: student.id,
      group_id: groupId
    });

  if (sgErr) {
    return json({ error: sgErr.message }, { status: 400 });
  }

  return json({ message: 'Podopieczny dodany', student }, { status: 201 });
}
