import { json } from '@sveltejs/kit';

/**
 * GET /api/messages/conversation/:conversationId
 * Zwraca: conversation + messages[]
 */
export async function GET({ locals, params }) {
  const supabase = locals.supabase;
  const { conversationId } = params;

  // ✅ auth
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  if (!conversationId) {
    return json({ error: 'Brak conversationId' }, { status: 400 });
  }

  // ✅ conversation
  const { data: conversation, error: convErr } = await supabase
    .from('conversations')
    .select('id, trainer_id, other_profile_id, created_at, updated_at')
    .eq('id', conversationId)
    .single();

  if (convErr || !conversation) {
    return json({ error: 'Nie znaleziono rozmowy' }, { status: 404 });
  }

  // ✅ membership check
  const isMember =
    conversation.trainer_id === user.id || conversation.other_profile_id === user.id;

  if (!isMember) {
    return json({ error: 'Brak dostępu' }, { status: 403 });
  }

  // ✅ messages
  const { data: messages, error: msgErr } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, body, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (msgErr) {
    return json({ error: msgErr.message }, { status: 400 });
  }

  return json(
    {
      conversation,
      messages: messages || []
    },
    { status: 200 }
  );
}
