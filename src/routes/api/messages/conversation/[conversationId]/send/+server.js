import { json } from '@sveltejs/kit';

export async function POST({ locals, params, request }) {
  const supabase = locals.supabase;
  const conversationId = params.conversationId;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authErr || !user) return json({ error: 'Brak autoryzacji' }, { status: 401 });

  const { body } = await request.json();
  const cleaned = String(body || '').trim();

  if (!cleaned) return json({ error: 'Pusta wiadomość' }, { status: 400 });

  const { data: msg, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: cleaned
    })
    .select()
    .single();

  if (error) return json({ error: error.message }, { status: 400 });

  // update conversation updated_at
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return json({ message: msg }, { status: 201 });
}
