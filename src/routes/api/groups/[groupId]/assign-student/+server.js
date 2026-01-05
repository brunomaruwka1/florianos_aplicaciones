import { json } from '@sveltejs/kit';

export async function POST({ params, locals, request }) {
  const supabase = locals.supabase;
  const groupId = params.groupId;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const { student_id } = await request.json();
  if (!student_id) {
    return json({ error: 'Brak student_id' }, { status: 400 });
  }

  const { error } = await supabase
    .from('student_groups')
    .insert({
      student_id,
      group_id: groupId
    });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json({ message: 'Student przypisany do grupy' }, { status: 201 });
}
