import { json } from '@sveltejs/kit';

/**
 * PATCH — edycja dziecka
 */
export async function PATCH({ locals, params, request }) {
  const supabase = locals.supabase;
  const childId = params.childId;

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const { first_name, last_name, birth_date } = await request.json();

  const { data: child, error } = await supabase
    .from('students')
    .update({
      first_name,
      last_name,
      birth_date
    })
    .eq('id', childId)
    .select()
    .single();

  if (error) {
    console.error('PATCH child error:', error);
    return json({ error: error.message }, { status: 400 });
  }

  return json({ child }, { status: 200 });
}

/**
 * DELETE — usunięcie dziecka
 */
export async function DELETE({ locals, params }) {
  const supabase = locals.supabase;
  const childId = params.childId;

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', childId);

  if (error) {
    console.error('DELETE child error:', error);
    return json({ error: error.message }, { status: 400 });
  }

  return json({ success: true }, { status: 200 });
}
