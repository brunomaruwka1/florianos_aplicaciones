import { json } from '@sveltejs/kit';

/**
 * POST /api/messages/conversation
 *
 * Body: { other_profile_id }
 * - tworzy rozmowę lub zwraca istniejącą
 */
export async function POST({ locals, request }) {
  const supabase = locals.supabase;

  // ✅ auth
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const { other_profile_id } = await request.json();

  if (!other_profile_id) {
    return json({ error: 'Brak other_profile_id' }, { status: 400 });
  }

  // ✅ rola
  const { data: myProfile, error: myProfileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (myProfileErr || !myProfile?.role) {
    return json({ error: 'Brak profilu/roli' }, { status: 400 });
  }

  // ✅ determine trainer_id / other_profile_id
  let trainer_id = null;
  let other_id = null;

  if (myProfile.role === 'trainer') {
    trainer_id = user.id;
    other_id = other_profile_id;
  } else {
    // student/parent -> trainer must be "other_profile_id"
    trainer_id = other_profile_id;
    other_id = user.id;
  }

  if (!trainer_id || !other_id) {
    return json({ error: 'Nieprawidłowe dane rozmowy' }, { status: 400 });
  }

  // 1) sprawdź czy już istnieje
  const { data: existing, error: existingErr } = await supabase
    .from('conversations')
    .select('id, trainer_id, other_profile_id, created_at')
    .eq('trainer_id', trainer_id)
    .eq('other_profile_id', other_id)
    .maybeSingle();

  if (existingErr) {
    return json({ error: existingErr.message }, { status: 400 });
  }

  if (existing) {
    return json({ conversation: existing }, { status: 200 });
  }

  // 2) create
  const { data: conversation, error: createErr } = await supabase
    .from('conversations')
    .insert({
      trainer_id,
      other_profile_id: other_id
    })
    .select('id, trainer_id, other_profile_id, created_at')
    .single();

  if (createErr) {
    return json({ error: createErr.message }, { status: 400 });
  }

  return json({ conversation }, { status: 201 });
}
