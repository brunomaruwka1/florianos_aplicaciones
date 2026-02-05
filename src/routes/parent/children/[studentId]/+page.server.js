import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params }) {
  const supabase = locals.supabase;
  const studentId = params.studentId;

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) throw redirect(303, '/login');

  // sprawdź relację parent -> student
  const { data: rel } = await supabase
    .from('parent_student')
    .select('student_id')
    .eq('parent_id', user.id)
    .eq('student_id', studentId)
    .single();

  if (!rel) {
    throw error(403, 'Brak dostępu do tego ucznia');
  }

  // student
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();

  // historia zajęć (to samo co u studenta)
  const { data: history } = await supabase
    .from('class_session_students')
    .select(`
      present,
      grade,
      note,
      session:class_sessions (
        session_date,
        start_time,
        end_time,
        group:groups (
          name
        )
      )
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  return {
    student,
    history: history || []
  };
}
