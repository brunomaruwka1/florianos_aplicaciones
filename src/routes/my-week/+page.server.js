import { redirect } from '@sveltejs/kit';

/** ISO YYYY-MM-DD -> Date w local time (bez przesunięć UTC) */
function dateFromISO(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 12, 0, 0); // godzina 12:00 = brak ryzyka cofnięcia dnia
}

/** Date -> ISO YYYY-MM-DD w local time */
function toISODateLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** zawsze zwraca poniedziałek tygodnia */
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=niedziela
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(12, 0, 0, 0);
  return d;
}

export async function load({ locals, url }) {
  const supabase = locals.supabase;

  const session = locals.session;
  if (!session) throw redirect(303, '/login');

  const userId = session.user.id;

  // rola
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (!profile || profile.role !== 'trainer') {
    throw redirect(303, '/groups');
  }

  const weekParam = url.searchParams.get('week');
  const parsed = dateFromISO(weekParam);
  const weekStart = getMonday(parsed || new Date());
  const weekISO = toISODateLocal(weekStart);

  // classes
  const { data: classes } = await supabase
    .from('classes')
    .select(`
      id,
      day_of_week,
      start_time,
      end_time,
      group:groups (
        id,
        name
      )
    `)
    .order('day_of_week', { ascending: true });

  return {
    role: profile.role,
    classes: classes || [],
    week: weekISO
  };
}
