import { json } from '@sveltejs/kit';

export async function DELETE({ params, locals }) {
  const supabase = locals.supabase;
  const { groupId, studentId } = params;

  console.log('DELETE student from group:', { groupId, studentId });

  // 🔐 autoryzacja
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData?.user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  // ❌ usuń relację student ↔ grupa
  const { data, error } = await supabase
    .from('student_groups')
    .delete()
    .eq('group_id', groupId)
    .eq('student_id', studentId)
    .select();

  if (error) {
    console.error('DELETE student_groups error:', error);
    return json({ error: error.message }, { status: 400 });
  }

  // 🧠 jeśli nic nie usunięto (np. już nie był w grupie)
  if (!data || data.length === 0) {
    return json(
      { error: 'Nie znaleziono przypisania studenta do tej grupy' },
      { status: 404 }
    );
  }

  return json({ success: true });
}
