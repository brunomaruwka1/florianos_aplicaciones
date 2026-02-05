import { json } from '@sveltejs/kit';

export async function GET({ locals, params }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const sessionId = params.sessionId;

  if (!sessionId) {
    return json({ error: 'Brak sessionId' }, { status: 400 });
  }

  const { data: session, error: sessionErr } = await supabase
    .from('class_sessions')
    .select(`
      id,
      class_id,
      group_id,
      trainer_id,
      session_date,
      start_time,
      end_time,
      status,
      created_at,
      finished_at,
      group:groups(id, name)
    `)
    .eq('id', sessionId)
    .single();

  if (sessionErr || !session) {
    return json({ error: sessionErr?.message || 'Nie znaleziono sesji' }, { status: 400 });
  }

  const { data: rows, error: studentsErr } = await supabase
    .from('class_session_students')
    .select(`
      student_id,
      present,
      grade,
      note,
      student:students(id, first_name, last_name)
    `)
    .eq('session_id', sessionId);

  if (studentsErr) {
    return json({ error: studentsErr.message }, { status: 400 });
  }

  const students = (rows || [])
    .map((r) => ({
      student_id: r.student_id,
      present: r.present,
      grade: r.grade,
      note: r.note,
      first_name: r.student?.first_name,
      last_name: r.student?.last_name
    }))
    .sort((a, b) => {
      const aa = `${a.last_name || ''} ${a.first_name || ''}`.toLowerCase();
      const bb = `${b.last_name || ''} ${b.first_name || ''}`.toLowerCase();
      return aa.localeCompare(bb);
    });

  return json({ session, students }, { status: 200 });
}

export async function PATCH({ locals, params, request }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const sessionId = params.sessionId;

  const body = await request.json();
  const students = body.students;

  if (!Array.isArray(students) || students.length === 0) {
    return json({ error: 'Brak danych students[]' }, { status: 400 });
  }

  const updates = students.map((s) => ({
    session_id: sessionId,
    student_id: s.student_id,
    present: s.present ?? null,
    grade: s.grade ?? null,
    note: s.note ?? null,
    updated_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('class_session_students')
    .upsert(updates, { onConflict: 'session_id,student_id' });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json({ success: true }, { status: 200 });
}
