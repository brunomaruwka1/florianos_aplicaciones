import { json } from '@sveltejs/kit';

export async function POST({ locals, params }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const sessionId = params.sessionId;

  if (!sessionId) {
    return json({ error: 'Brak sessionId' }, { status: 400 });
  }

  const { data: updated, error } = await supabase
    .from('class_sessions')
    .update({
      status: 'finished',
      finished_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .eq('status', 'open') 
    .select()
    .single();

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  if (!updated) {
    return json({ error: 'Sesja jest już zakończona lub nie istnieje' }, { status: 400 });
  }

  return json({ success: true, session: updated }, { status: 200 });
}
