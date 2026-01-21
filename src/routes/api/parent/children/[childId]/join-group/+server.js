import { json } from '@sveltejs/kit';

export async function POST({ locals, params, request }) {
  const supabase = locals.supabase;

  // 1) auth
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const childId = params.childId;
  if (!childId) {
    return json({ error: 'Brak childId' }, { status: 400 });
  }

  const { token } = await request.json();
  const cleanedToken = token?.trim();

  if (!cleanedToken) {
    return json({ error: 'Brak tokenu' }, { status: 400 });
  }

  // 2) czy dziecko jest powiązane z rodzicem?
  const { data: link, error: linkErr } = await supabase
    .from('parent_student')
    .select('student_id')
    .eq('parent_id', user.id)
    .eq('student_id', childId)
    .maybeSingle();

  if (linkErr) {
    return json({ error: linkErr.message }, { status: 400 });
  }

  if (!link) {
    return json({ error: 'To dziecko nie należy do tego rodzica' }, { status: 403 });
  }

  // 3) pobierz invite
  const { data: invite, error: inviteErr } = await supabase
    .from('group_invites')
    .select('id, group_id, trainer_id, status, expires_at')
    .eq('token', cleanedToken)
    .single();

  if (inviteErr || !invite) {
    return json({ error: 'Nieprawidłowy token' }, { status: 400 });
  }

  if (invite.status !== 'pending') {
    return json({ error: 'Token został już użyty' }, { status: 400 });
  }

  // (opcjonalnie expiry)
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return json({ error: 'Token wygasł' }, { status: 400 });
  }

  // 4) update token -> accepted
  const { error: updErr } = await supabase
    .from('group_invites')
    .update({ status: 'accepted' })
    .eq('id', invite.id)
    .eq('status', 'pending');

  if (updErr) {
    return json({ error: updErr.message }, { status: 400 });
  }

  // 5) join group (student_groups)
  const { error: joinErr } = await supabase
    .from('student_groups')
    .insert({
      student_id: childId,
      group_id: invite.group_id
    });

  if (joinErr) {
    return json({ error: joinErr.message }, { status: 400 });
  }

  // 6) trainer_student relacja
  const { error: tsErr } = await supabase
    .from('trainer_student')
    .insert({
      trainer_id: invite.trainer_id, // UWAGA: tu musi być to samo co w FK
      student_id: childId
    });

  if (tsErr) {
    return json({ error: tsErr.message }, { status: 400 });
  }

  return json({ success: true }, { status: 200 });
}
