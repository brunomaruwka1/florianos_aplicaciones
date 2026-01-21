import { redirect, error as kitError } from '@sveltejs/kit';

export async function load({ locals, params }) {
  const supabase = locals.supabase;
  const session = locals.session;

  if (!session) throw redirect(303, '/login');

  const studentId = params.studentId;
  if (!studentId) throw kitError(400, 'Brak studentId');

  // ✅ student info
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('id, first_name, last_name, birth_date, created_at')
    .eq('id', studentId)
    .single();

  if (studentErr || !student) {
    console.error(studentErr);
    throw kitError(404, 'Nie znaleziono studenta');
  }

  // ✅ historia sesji (frekwencja + oceny)
  const { data: historyRaw, error: histErr } = await supabase
    .from('class_session_students')
    .select(`
      present,
      grade,
      note,
      created_at,
      session:class_sessions (
        id,
        session_date,
        start_time,
        end_time,
        status,
        group:groups (
          id,
          name
        )
      )
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (histErr) {
    console.error('History fetch error:', histErr);
    throw kitError(500, 'Błąd pobierania historii zajęć');
  }

  const history = (historyRaw || [])
    .map((row) => ({
      present: row.present,
      grade: row.grade,
      note: row.note,
      created_at: row.created_at,
      session: row.session
    }))
    .filter((x) => x.session); // usuń nulle

  return {
    student,
    history
  };
}
