export async function load({ params, locals }) {
  const supabase = locals.supabase;
  const groupId = params.groupId;

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  const { data: groupStudentsRaw } = await supabase
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

  const groupStudents = (groupStudentsRaw || [])
    .map(r => r.student)
    .filter(Boolean);

  const { data: allStudents } = await supabase
    .from('students')
    .select('id, first_name, last_name')
    .order('last_name');

  return {
    group,
    groupStudents,
    allStudents: allStudents || []
  };
}
