import { json } from '@sveltejs/kit';

function validateDayOfWeek(d) {
  const n = Number(d);
  return Number.isInteger(n) && n >= 0 && n <= 6;
}

// =========================
// GET – lista zajęć + rola
// =========================

export async function GET({ locals }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  // =========================
  // ROLA
  // =========================
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile?.role) {
    return json({ error: 'Brak profilu lub roli' }, { status: 400 });
  }

  const role = profile.role;

  // =========================
  // TRENER / ADMIN
  // =========================
  if (role === 'trainer' || role === 'admin') {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        id,
        day_of_week,
        start_time,
        end_time,
        created_at,
        group_id:groups (
          id,
          name
        )
      `)
      .order('day_of_week')
      .order('start_time');

    if (error) {
      console.error(error);
      return json({ role, classes: [] });
    }

    return json({ role, classes: data || [] });
  }

  // =========================
  // STUDENT
  // =========================
  if (role === 'student') {
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (!student) {
      return json({ role, classes: [] });
    }

    const { data: studentGroups } = await supabase
      .from('student_groups')
      .select('group_id')
      .eq('student_id', student.id);

    const groupIds = (studentGroups || []).map((g) => g.group_id);

    if (groupIds.length === 0) {
      return json({ role, classes: [] });
    }

    const { data } = await supabase
      .from('classes')
      .select(`
        id,
        day_of_week,
        start_time,
        end_time,
        created_at,
        group_id:groups (
          id,
          name
        )
      `)
      .in('group_id', groupIds)
      .order('day_of_week')
      .order('start_time');

    return json({ role, classes: data || [] });
  }

  // =========================
  // PARENT – ZAJĘCIA DZIECI
  // =========================
  if (role === 'parent') {
    // dzieci rodzica
    const { data: links, error: psErr } = await supabase
      .from('parent_student')
      .select('student_id')
      .eq('parent_id', user.id);

    const studentIds = (links || []).map((l) => l.student_id);

    if (studentIds.length === 0) {
      return json({ role, classes: [] });
    }

    // grupy dzieci
    const { data: studentGroups, error: groupErr } = await supabase
      .from('student_groups')
      .select('group_id')
      .in('student_id', studentIds);

    const groupIds = [
      ...new Set((studentGroups || []).map((g) => g.group_id))
    ];

    if (groupIds.length === 0) {
      return json({ role, classes: [] });
    }

    // zajęcia tych grup
    const { data } = await supabase
      .from('classes')
      .select(`
        id,
        day_of_week,
        start_time,
        end_time,
        created_at,
        group_id:groups (
          id,
          name
        )
      `)
      .in('group_id', groupIds)
      .order('day_of_week')
      .order('start_time');

    return json({ role, classes: data || [] });
  }

  // fallback
  return json({ role, classes: [] });
}


// =========================
// helper – tylko trener
// =========================
async function assertTrainer(supabase, userId) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return !error && profile?.role === 'trainer';
}

// =========================
// POST – dodawanie zajęć
// =========================
export async function POST({ locals, request }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  if (!(await assertTrainer(supabase, user.id))) {
    return json({ error: 'Tylko trener może dodawać zajęcia' }, { status: 403 });
  }

  const { group_id, day_of_week, start_time, end_time } = await request.json();

  if (!group_id || !validateDayOfWeek(day_of_week) || !start_time) {
    return json({ error: 'Brak wymaganych danych' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('classes')
    .insert({
      group_id,
      day_of_week: Number(day_of_week),
      start_time,
      end_time: end_time || null,
      created_by: user.id
    })
    .select(`
      id,
      day_of_week,
      start_time,
      end_time,
      created_at,
      group_id:groups (
        id,
        name
      )
    `)
    .single();

  if (error) {
    console.error('POST classes error:', error);
    return json({ error: error.message }, { status: 400 });
  }

  return json({ message: 'Zajęcia dodane', class: data }, { status: 201 });
}

// =========================
// PATCH – edycja
// =========================
export async function PATCH({ locals, request }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  if (!(await assertTrainer(supabase, user.id))) {
    return json({ error: 'Tylko trener może edytować zajęcia' }, { status: 403 });
  }

  const { id, group_id, day_of_week, start_time, end_time } =
    await request.json();

  if (!id || !group_id || !validateDayOfWeek(day_of_week) || !start_time) {
    return json({ error: 'Brak wymaganych danych' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('classes')
    .update({
      group_id,
      day_of_week: Number(day_of_week),
      start_time,
      end_time: end_time || null
    })
    .eq('id', id)
    .select(`
      id,
      day_of_week,
      start_time,
      end_time,
      created_at,
      group_id:groups (
        id,
        name
      )
    `)
    .single();

  if (error) {
    console.error('PATCH classes error:', error);
    return json({ error: error.message }, { status: 400 });
  }

  return json({ message: 'Zajęcia zaktualizowane', class: data }, { status: 200 });
}

// =========================
// DELETE – usuwanie
// =========================
export async function DELETE({ locals, request }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  if (!(await assertTrainer(supabase, user.id))) {
    return json({ error: 'Tylko trener może usuwać zajęcia' }, { status: 403 });
  }

  const { id } = await request.json();

  if (!id) {
    return json({ error: 'Brak id' }, { status: 400 });
  }

  const { error } = await supabase.from('classes').delete().eq('id', id);

  if (error) {
    console.error('DELETE classes error:', error);
    return json({ error: error.message }, { status: 400 });
  }

  return json({ message: 'Zajęcia usunięte' }, { status: 200 });
}
