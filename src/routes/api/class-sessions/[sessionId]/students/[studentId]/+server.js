import { json } from '@sveltejs/kit';

export async function PATCH({ locals, params, request }) {
  const supabase = locals.supabase;
  const sessionId = params.sessionId;
  const studentId = params.studentId;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const body = await request.json();
  const { present, grade, note } = body;

  const update = {
    updated_at: new Date().toISOString()
  };

  if (present !== undefined) update.present = present;
  if (grade !== undefined) update.grade = grade;
  if (note !== undefined) update.note = note;

  const { data, error } = await supabase
    .from('class_session_students')
    .update(update)
    .eq('session_id', sessionId)
    .eq('student_id', studentId)
    .select()
    .single();

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json({ record: data }, { status: 200 });
}
