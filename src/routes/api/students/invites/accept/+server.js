import { json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
  const supabase = locals.supabase;

  // 1️⃣ auth
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const { token } = await request.json();
  if (!token) return json({ error: 'Brak tokenu' }, { status: 400 });

  // 2️⃣ student.id
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (studentErr || !student) {
    return json({ error: 'Brak rekordu studenta' }, { status: 400 });
  }

  // 3️⃣ invite
  const { data: invite, error: inviteErr } = await supabase
    .from('group_invites')
    .select('id, group_id, trainer_id, status, expires_at')
    .eq('token', token)
    .single();

  if (inviteErr || !invite) {
    return json({ error: 'Nieprawidłowy token' }, { status: 400 });
  }

  if (invite.status !== 'pending') {
    return json({ error: 'Token został już użyty' }, { status: 400 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return json({ error: 'Token wygasł' }, { status: 400 });
  }

  // 4️⃣ join group
  const { error: joinErr } = await supabase
    .from('student_groups')
    .insert({
      group_id: invite.group_id,
      student_id: student.id
    });

  if (joinErr) {
    return json({ error: joinErr.message }, { status: 400 });
  }

  // 5️⃣ trainer_student
  const { error: tsErr } = await supabase
    .from('trainer_student')
    .insert({
      trainer_id: invite.trainer_id, // profile_id trenera
      student_id: student.id
    });

  if (tsErr) {
    return json({ error: tsErr.message }, { status: 400 });
  }

  // 6️⃣ mark invite accepted
  const { error: updErr } = await supabase
    .from('group_invites')
    .update({ status: 'accepted' })
    .eq('id', invite.id);

  if (updErr) {
    return json({ error: updErr.message }, { status: 400 });
  }

  return json({ success: true }, { status: 200 });
}
