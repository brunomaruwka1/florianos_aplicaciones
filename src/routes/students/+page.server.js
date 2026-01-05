// src/routes/students/+page.server.js  (lub tam gdzie masz load)
import { json } from '@sveltejs/kit';

export async function load({ locals }) {
  const supabase = locals.supabase;

  // pobieramy grupy trenera
  const { data: groups, error: groupsErr } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false });

  if (groupsErr) {
    console.error('ERROR fetching groups:', groupsErr);
    // możesz też zwrócić error(...) jeśli chcesz przerwać ładowanie strony
  }
  
  const { data: students, error: studentsErr } = await supabase
    .from('students')
    .select('id, first_name, last_name, birth_date, created_at')
    .order('created_at', { ascending: false });


  if (studentsErr) {
    console.error('ERROR fetching students:', studentsErr);
  }

  return {
    groups: groups || [],
    students: students || []
  };
}
