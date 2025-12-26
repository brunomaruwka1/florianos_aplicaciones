// src/routes/groups/[id]/+page.server.js
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
  const supabase = locals.supabase;
  const groupId = params.id;

  // 1️⃣ grupa
  const { data: group, error: groupErr } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (groupErr) {
    throw error(404, 'Nie znaleziono grupy');
  }

  // 2️⃣ studenci w tej grupie
  const { data: groupStudentsRaw, error: gsErr } = await supabase
    .from('student_groups')
    .select(`
      student:students (
        id,
        first_name,
        last_name,
        birth_date
      )
    `)
    .eq('group_id', groupId);

  if (gsErr) {
    console.error('GROUP STUDENTS ERROR:', gsErr);
  }

  const groupStudents = (groupStudentsRaw || [])
    .map(r => r.student)
    .filter(Boolean);

  // 3️⃣ wszyscy studenci trenera
  const { data: allStudents, error: allErr } = await supabase
    .from('students')
    .select('id, first_name, last_name')
    .order('last_name');

  if (allErr) {
    console.error('ALL STUDENTS ERROR:', allErr);
  }

  return {
    group,
    groupStudents,
    allStudents: allStudents || []
  };
}
