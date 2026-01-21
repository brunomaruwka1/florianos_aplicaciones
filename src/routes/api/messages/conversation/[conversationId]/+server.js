import { json } from '@sveltejs/kit';

export async function GET({ locals, params }) {
  const supabase = locals.supabase;
  const conversationId = params.conversationId;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authErr || !user) return json({ error: 'Brak autoryzacji' }, { status: 401 });

  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, body, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) return json({ error: error.message }, { status: 400 });

  return json({ messages: data || [] }, { status: 200 });
}
