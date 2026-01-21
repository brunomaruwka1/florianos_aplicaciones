import { json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authErr || !user) return json({ error: 'Brak autoryzacji' }, { status: 401 });

  const { other_profile_id } = await request.json();
  if (!other_profile_id) return json({ error: 'Brak other_profile_id' }, { status: 400 });

  // rola
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'trainer') {
    return json({ error: 'Tylko trener może tworzyć konwersacje' }, { status: 403 });
  }

  // 1) sprawdzamy czy istnieje
  const { data: existing, error: exErr } = await supabase
    .from('conversations')
    .select('id')
    .eq('trainer_id', user.id)
    .eq('other_profile_id', other_profile_id)
    .maybeSingle();

  if (exErr) return json({ error: exErr.message }, { status: 400 });

  if (existing) {
    return json({ conversation: existing }, { status: 200 });
  }

  // 2) create
  const { data: convo, error: convoErr } = await supabase
    .from('conversations')
    .insert({
      trainer_id: user.id,
      other_profile_id
    })
    .select()
    .single();

  if (convoErr) return json({ error: convoErr.message }, { status: 400 });

  return json({ conversation: convo }, { status: 201 });
}
