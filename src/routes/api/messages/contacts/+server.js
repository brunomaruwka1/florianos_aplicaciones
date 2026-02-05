import { json } from '@sveltejs/kit';

/**
 * GET /api/messages/contacts
 *
 * ROLE LOGIC:
 * - STUDENT -> trenerzy (trainer_student)
 * - PARENT  -> trenerzy dzieci (parent_student -> trainer_student)
 * - TRAINER -> studenci + rodzice (jak wcześniej, ale uproszczone)
 */
export async function GET({ locals }) {
  const supabase = locals.supabase;

  /* =========================
   * AUTH
   * ========================= */
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  /* =========================
   * PROFILE / ROLE
   * ========================= */
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile?.role) {
    return json({ error: 'Brak profilu lub roli' }, { status: 400 });
  }

  const role = profile.role;

  /* =====================================================
   * STUDENT -> trenerzy
   * ===================================================== */
  if (role === 'student') {
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (studentErr || !student) {
      return json({ contacts: [] }, { status: 200 });
    }

    const { data: tsRows, error: tsErr } = await supabase
      .from('trainer_student')
      .select('trainer_id')
      .eq('student_id', student.id);

    if (tsErr) {
      console.error('trainer_student error (student):', tsErr);
      return json({ contacts: [] }, { status: 200 });
    }

    const trainerIds = [...new Set((tsRows || []).map(r => r.trainer_id))];

    if (trainerIds.length === 0) {
      return json({ contacts: [] }, { status: 200 });
    }

    const { data: trainers, error: trainersErr } = await supabase
      .from('profiles')
      .select('id')
      .in('id', trainerIds);

    if (trainersErr) {
      console.error('profiles error (student):', trainersErr);
      return json({ contacts: [] }, { status: 200 });
    }

    const contacts = (trainers || []).map(t => ({
      type: 'trainer',
      profile_id: t.id,
      label: `Trener (${t.id.slice(0, 8)})`
    }));

    return json({ contacts }, { status: 200 });
  }

  /* =====================================================
   * PARENT -> trenerzy dzieci
   * ===================================================== */
  if (role === 'parent') {
    // 1️⃣ dzieci rodzica
    const { data: psRows, error: psErr } = await supabase
      .from('parent_student')
      .select('student_id')
      .eq('parent_id', user.id);

    if (psErr) {
      console.error('parent_student error:', psErr);
      return json({ contacts: [] }, { status: 200 });
    }

    const studentIds = (psRows || []).map(r => r.student_id);

    if (studentIds.length === 0) {
      return json({ contacts: [] }, { status: 200 });
    }

    // 2️⃣ trenerzy dzieci
    const { data: tsRows, error: tsErr } = await supabase
      .from('trainer_student')
      .select('trainer_id')
      .in('student_id', studentIds);

    if (tsErr) {
      console.error('trainer_student error (parent):', tsErr);
      return json({ contacts: [] }, { status: 200 });
    }

    const trainerIds = [...new Set((tsRows || []).map(r => r.trainer_id))];

    if (trainerIds.length === 0) {
      return json({ contacts: [] }, { status: 200 });
    }

    // 3️⃣ profile trenerów
    const { data: trainers, error: trainersErr } = await supabase
      .from('profiles')
      .select('id')
      .in('id', trainerIds);

    if (trainersErr) {
      console.error('profiles error (parent):', trainersErr);
      return json({ contacts: [] }, { status: 200 });
    }

    const contacts = (trainers || []).map(t => ({
      type: 'trainer',
      profile_id: t.id,
      label: `Trener (${t.id.slice(0, 8)})`
    }));

    return json({ contacts }, { status: 200 });
  }

  /* =====================================================
   * TRAINER -> studenci + rodzice
   * ===================================================== */
  if (role === 'trainer') {
    // 1️⃣ studenci trenera
    const { data: tsRows, error: tsErr } = await supabase
      .from('trainer_student')
      .select('student_id')
      .eq('trainer_id', user.id);

    if (tsErr) {
      console.error('trainer_student error (trainer):', tsErr);
      return json({ contacts: [] }, { status: 200 });
    }

    const studentIds = (tsRows || []).map(r => r.student_id);

    if (studentIds.length === 0) {
      return json({ contacts: [] }, { status: 200 });
    }

    const { data: students, error: studentsErr } = await supabase
      .from('students')
      .select('id, first_name, last_name, profile_id')
      .in('id', studentIds);

    if (studentsErr) {
      console.error('students error:', studentsErr);
      return json({ contacts: [] }, { status: 200 });
    }

    const studentContacts = (students || [])
      .filter(s => s.profile_id)
      .map(s => ({
        type: 'student',
        profile_id: s.profile_id,
        label: `${s.first_name} ${s.last_name}`.trim()
      }));

    // 2️⃣ rodzice (dzieci bez profilu)
    const studentsWithoutProfile = (students || []).filter(s => !s.profile_id);

    let parentContacts = [];

    if (studentsWithoutProfile.length > 0) {
      const childIds = studentsWithoutProfile.map(s => s.id);

      const { data: psRows, error: psErr } = await supabase
        .from('parent_student')
        .select('parent_id, student_id')
        .in('student_id', childIds);

      if (!psErr && psRows?.length) {
        const parentIds = [...new Set(psRows.map(r => r.parent_id))];

        const { data: parents } = await supabase
          .from('profiles')
          .select('id')
          .in('id', parentIds);

        parentContacts = (parents || []).map(p => ({
          type: 'parent',
          profile_id: p.id,
          label: 'Rodzic'
        }));
      }
    }

    const contacts = [...studentContacts, ...parentContacts].sort((a, b) =>
      a.label.localeCompare(b.label, 'pl')
    );

    return json({ contacts }, { status: 200 });
  }

  /* =====================================================
   * FALLBACK
   * ===================================================== */
  return json({ contacts: [] }, { status: 200 });
}
