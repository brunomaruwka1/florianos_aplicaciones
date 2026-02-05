import { json } from '@sveltejs/kit';

/**
 * POST /api/messages/conversation/:conversationId/send
 * Body: { body }
 */
export async function POST({ locals, params, request }) {
  const supabase = locals.supabase;
  const { conversationId } = params;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const { body } = await request.json();
  const clean = String(body || '').trim();

  if (!clean) {
    return json({ error: 'Pusta wiadomość' }, { status: 400 });
  }

  const { data: conversation, error: convErr } = await supabase
    .from('conversations')
    .select('id, trainer_id, other_profile_id')
    .eq('id', conversationId)
    .single();

  if (convErr || !conversation) {
    return json({ error: 'Nie znaleziono rozmowy' }, { status: 404 });
  }

  const isMember =
    conversation.trainer_id === user.id || conversation.other_profile_id === user.id;

  if (!isMember) {
    return json({ error: 'Brak dostępu' }, { status: 403 });
  }

  const { data: message, error: msgErr } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: clean
    })
    .select('id, conversation_id, sender_id, body, created_at')
    .single();

  if (msgErr) {
    return json({ error: msgErr.message }, { status: 400 });
  }

  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return json({ message }, { status: 201 });
}
