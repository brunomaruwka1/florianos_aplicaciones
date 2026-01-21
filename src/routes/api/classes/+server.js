import { json } from '@sveltejs/kit';

function validateDayOfWeek(d) {
  const n = Number(d);
  return Number.isInteger(n) && n >= 0 && n <= 6;
}

export async function GET({ locals }) {
  const supabase = locals.supabase;

  // ✅ auth
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  // ✅ rola
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile?.role) {
    return json({ error: 'Brak profilu/roli użytkownika' }, { status: 400 });
  }

  const role = profile.role;

  /* --------------------------------------------------
   * TRAINER / PARENT / ADMIN
   * - zostawiamy dotychczasową logikę (RLS filtruje)
   * -------------------------------------------------- */
  if (role !== 'student') {
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
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('GET classes error:', error);
      return json({ error: error.message }, { status: 400 });
    }

    return json(data || [], { status: 200 });
  }

  /* --------------------------------------------------
   * STUDENT
   * - zajęcia grup do których student należy
   * -------------------------------------------------- */

  // 1) student id
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (studentErr || !student) {
    return json({ error: 'Brak rekordu student' }, { status: 400 });
  }

  // 2) group_ids z relacji student_groups
  const { data: studentGroups, error: sgErr } = await supabase
    .from('student_groups')
    .select('group_id')
    .eq('student_id', student.id);

  if (sgErr) {
    console.error('GET student_groups error:', sgErr);
    return json({ error: sgErr.message }, { status: 400 });
  }

  const groupIds = (studentGroups || []).map((x) => x.group_id).filter(Boolean);

  if (groupIds.length === 0) {
    return json([], { status: 200 });
  }

  // 3) zajęcia tych grup
  const { data: classes, error: classErr } = await supabase
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
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (classErr) {
    console.error('GET student classes error:', classErr);
    return json({ error: classErr.message }, { status: 400 });
  }

  return json(classes || [], { status: 200 });
}

/* ======================================================
 * POST / PATCH / DELETE — TYLKO TRENER
 * ====================================================== */

async function assertTrainer(supabase, userId) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || profile?.role !== 'trainer') {
    return false;
  }

  return true;
}

export async function POST({ locals, request }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  // ✅ tylko trener
  const ok = await assertTrainer(supabase, user.id);
  if (!ok) {
    return json({ error: 'Tylko trener może dodawać zajęcia' }, { status: 403 });
  }

  const body = await request.json();
  const { group_id, day_of_week, start_time, end_time } = body;

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

export async function PATCH({ locals, request }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  // ✅ tylko trener
  const ok = await assertTrainer(supabase, user.id);
  if (!ok) {
    return json({ error: 'Tylko trener może edytować zajęcia' }, { status: 403 });
  }

  const body = await request.json();
  const { id, group_id, day_of_week, start_time, end_time } = body;

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

export async function DELETE({ locals, request }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  // ✅ tylko trener
  const ok = await assertTrainer(supabase, user.id);
  if (!ok) {
    return json({ error: 'Tylko trener może usuwać zajęcia' }, { status: 403 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return json({ error: 'Brak id' }, { status: 400 });
  }

  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('DELETE classes error:', error);
    return json({ error: error.message }, { status: 400 });
  }

  return json({ message: 'Zajęcia usunięte' }, { status: 200 });
}
