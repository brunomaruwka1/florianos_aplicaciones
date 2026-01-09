// src/routes/students/+page.server.js
export async function load({ locals }) {
  const supabase = locals.supabase;

  const { data: students, error } = await supabase
    .from('students')
    .select('id, first_name, last_name, birth_date, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('ERROR fetching students:', error);
  }

  return {
    students: students || []
  };
}
