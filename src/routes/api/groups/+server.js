import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Musisz być zalogowany' }, { status: 401 });
  }

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile?.role) {
    return json({ error: 'Brak profilu/roli użytkownika' }, { status: 400 });
  }

  const role = profile.role;

  if (role === 'trainer') {
    const { data, error } = await supabase
      .from('group_trainers')
      .select('group:groups(id, name, description, created_at)')
      .eq('trainer_id', user.id)
      .order('created_at', { foreignTable: 'groups', ascending: false });

    if (error) {
      console.error('Trainer groups fetch error:', error);
      return json({ error: error.message }, { status: 500 });
    }

    const groups = (data || []).map((row) => row.group).filter(Boolean);
    return json(groups, { status: 200 });
  }

  if (role === 'student') {
    // student id
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (studentErr || !student) {
      return json({ error: 'Brak rekordu student' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('student_groups')
      .select('group:groups(id, name, description, created_at)')
      .eq('student_id', student.id)
      .order('created_at', { foreignTable: 'groups', ascending: false });

    if (error) {
      console.error('Student groups fetch error:', error);
      return json({ error: error.message }, { status: 500 });
    }

    const groups = (data || []).map((row) => row.group).filter(Boolean);
    return json(groups, { status: 200 });
  }

  return json({ error: 'Nieobsługiwana rola użytkownika' }, { status: 400 });
}

export async function POST({ locals, request }) {
  const supabase = locals.supabase;

  const body = await request.json();
  const { name, description } = body;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Musisz być zalogowany' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'trainer') {
    return json({ error: 'Tylko trener może tworzyć grupy' }, { status: 403 });
  }

  if (!name) {
    return json({ error: "Pole 'name' jest wymagane" }, { status: 400 });
  }

  const { data: group, error: groupErr } = await supabase
    .from('groups')
    .insert({
      name,
      description: description ?? null,
      created_by: user.id
    })
    .select()
    .single();

  if (groupErr) {
    return json({ error: groupErr.message }, { status: 400 });
  }

  const { error: relErr } = await supabase
    .from('group_trainers')
    .insert({
      group_id: group.id,
      trainer_id: user.id
    });

  if (relErr) {
    return json(
      {
        error:
          'Grupa utworzona, ale nie udało się przypisać trenera: ' +
          relErr.message
      },
      { status: 400 }
    );
  }

  return json({ message: 'Grupa dodana!', group }, { status: 201 });
}
