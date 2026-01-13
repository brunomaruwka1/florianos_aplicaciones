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

  // ✅ pobierz zajęcia — tylko te do których trener ma dostęp (RLS)
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

export async function POST({ locals, request }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
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
