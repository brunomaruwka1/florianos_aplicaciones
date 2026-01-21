import { json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
  const supabase = locals.supabase;

  // 1) auth
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const { class_id, session_date } = await request.json();

  if (!class_id || !session_date) {
    return json({ error: 'Brak class_id lub session_date' }, { status: 400 });
  }

  // 2) pobierz class (żeby znać group_id i godziny)
  const { data: cls, error: clsErr } = await supabase
    .from('classes')
    .select('id, group_id, start_time, end_time')
    .eq('id', class_id)
    .single();

  if (clsErr || !cls) {
    return json({ error: clsErr?.message || 'Nie znaleziono class' }, { status: 400 });
  }

  // 3) spróbuj znaleźć istniejącą sesję
  const { data: existing, error: existErr } = await supabase
    .from('class_sessions')
    .select('*')
    .eq('class_id', class_id)
    .eq('session_date', session_date)
    .maybeSingle();

  if (existErr) {
    return json({ error: existErr.message }, { status: 400 });
  }

  let session = existing;

  // 4) jeśli nie ma — tworzymy
  if (!session) {
    const { data: created, error: createErr } = await supabase
      .from('class_sessions')
      .insert({
        class_id: cls.id,
        group_id: cls.group_id,
        trainer_id: user.id,
        session_date,
        start_time: cls.start_time,
        end_time: cls.end_time
      })
      .select()
      .single();

    if (createErr) {
      return json({ error: createErr.message }, { status: 400 });
    }

    session = created;
  }

  // 5) tworzymy wpisy w class_session_students (dla wszystkich studentów w grupie)
  // pobierz studentów w grupie
  const { data: groupStudents, error: gsErr } = await supabase
    .from('student_groups')
    .select('student_id')
    .eq('group_id', session.group_id);

  if (gsErr) {
    return json({ error: gsErr.message }, { status: 400 });
  }

  // bulk upsert rekordów do sesji
  const toInsert = (groupStudents || []).map((row) => ({
    session_id: session.id,
    student_id: row.student_id
  }));

  if (toInsert.length > 0) {
    const { error: cssErr } = await supabase
      .from('class_session_students')
      .upsert(toInsert, { onConflict: 'session_id,student_id' });

    if (cssErr) {
      return json({ error: cssErr.message }, { status: 400 });
    }
  }

  // ✅ NAJWAŻNIEJSZE: zwracamy zawsze { session }
  return json({ session }, { status: 200 });
}
