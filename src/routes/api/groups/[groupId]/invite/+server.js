import { json } from '@sveltejs/kit';
import crypto from 'crypto';

export async function POST({ locals, params }) {
  const supabase = locals.supabase;
  const groupId = params.groupId;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const { data: membership, error: memberErr } = await supabase
    .from('group_trainers')
    .select('group_id')
    .eq('group_id', groupId)
    .eq('trainer_id', user.id)
    .maybeSingle();

  if (memberErr) {
    return json({ error: memberErr.message }, { status: 400 });
  }

  if (!membership) {
    return json(
      { error: 'Nie masz uprawnień do tej grupy (brak wpisu w group_trainers)' },
      { status: 403 }
    );
  }

  const token = crypto.randomBytes(24).toString('hex');

  const { data: invite, error: inviteErr } = await supabase
    .from('group_invites')
    .insert({
      group_id: groupId,
      trainer_id: user.id,
      token
    })
    .select()
    .single();

  if (inviteErr) {
    return json({ error: inviteErr.message }, { status: 400 });
  }

  return json({ invite }, { status: 201 });
}
