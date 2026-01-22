import { json } from '@sveltejs/kit';

/**
 * GET /api/messages/contacts
 *
 * TRAINER:
 * 1) students.profile_id != null => student (13+)
 * 2) student.profile_id == null => parent via parent_student
 *
 * STUDENT:
 * - trenerzy powiązani przez trainer_student
 */
export async function GET({ locals }) {
  const supabase = locals.supabase;

  // ✅ auth
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  // ✅ role
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile?.role) {
    return json({ error: 'Brak profilu/roli użytkownika' }, { status: 400 });
  }

  const role = profile.role;

  /* =========================================================
   * ✅ STUDENT -> kontakt = trenerzy z trainer_student
   * ========================================================= */
  if (role === 'student') {
    // 1) znajdź students.id dla tego profilu
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id, first_name, last_name, profile_id')
      .eq('profile_id', user.id)
      .single();

    if (studentErr || !student) {
      return json(
        { error: 'Brak rekordu student dla tego profilu (students.profile_id)' },
        { status: 400 }
      );
    }

    // 2) trainer_student -> trainer_id (profiles.id)
    const { data: tsRows, error: tsErr } = await supabase
      .from('trainer_student')
      .select('trainer_id')
      .eq('student_id', student.id);

    if (tsErr) {
      console.error('trainer_student fetch error (student):', tsErr);
      return json({ error: tsErr.message }, { status: 400 });
    }


    console.log(tsRows)
    console.log("gowno kurwa")
    const trainerIds = [...new Set((tsRows || []).map((r) => r.trainer_id).filter(Boolean))];

    if (trainerIds.length === 0) {
      return json({ contacts: [] }, { status: 200 });
    }

    // 3) profile trenerów
    const { data: trainerProfiles, error: trainerProfilesErr } = await supabase
      .from('profiles')
      .select('id, role')
      .in('id', trainerIds);

    if (trainerProfilesErr) {
      console.error('profiles trainers fetch error:', trainerProfilesErr);
      return json({ error: trainerProfilesErr.message }, { status: 400 });
    }

    const contacts = (trainerProfiles || [])
      .filter((p) => p.role === 'trainer')
      .map((p) => ({
        type: 'trainer',
        profile_id: p.id,
        label: `Trener (${p.id.slice(0, 8)})`
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pl'));

    return json({ contacts }, { status: 200 });
  }

  /* =========================================================
   * ✅ TRAINER -> students + parents
   * ========================================================= */

  // 1) trainer_student -> student ids
  const { data: tsRows, error: tsErr } = await supabase
    .from('trainer_student')
    .select('student_id')
    .eq('trainer_id', user.id);

  if (tsErr) {
    console.error('trainer_student fetch error:', tsErr);
    return json({ error: tsErr.message }, { status: 400 });
  }

  const studentIds = (tsRows || []).map((r) => r.student_id).filter(Boolean);

  if (studentIds.length === 0) {
    return json({ contacts: [] }, { status: 200 });
  }

  // 2) fetch students
  const { data: students, error: studentsErr } = await supabase
    .from('students')
    .select('id, first_name, last_name, profile_id')
    .in('id', studentIds)
    .order('last_name', { ascending: true });

  if (studentsErr) {
    console.error('students fetch error:', studentsErr);
    return json({ error: studentsErr.message }, { status: 400 });
  }

  const studentsWithProfile = (students || []).filter((s) => !!s.profile_id);
  const studentsWithoutProfile = (students || []).filter((s) => !s.profile_id);

  // 3) student contacts (13+)
  const studentContacts = studentsWithProfile.map((s) => ({
    type: 'student',
    profile_id: s.profile_id,
    student_id: s.id,
    label: `${s.first_name} ${s.last_name}`.trim()
  }));

  // 4) parent contacts (children without profile)
  let parentContacts = [];

  if (studentsWithoutProfile.length > 0) {
    const childIds = studentsWithoutProfile.map((s) => s.id);

    const { data: psRows, error: psErr } = await supabase
      .from('parent_student')
      .select('parent_id, student_id')
      .in('student_id', childIds);

    if (psErr) {
      console.error('parent_student fetch error:', psErr);
      return json({ contacts: studentContacts }, { status: 200 });
    }

    const parentIds = [...new Set((psRows || []).map((r) => r.parent_id).filter(Boolean))];

    if (parentIds.length > 0) {
      const { data: parentProfiles, error: parentErr } = await supabase
        .from('profiles')
        .select('id')
        .in('id', parentIds);

      if (parentErr) {
        console.error('parent profiles fetch error:', parentErr);
      } else {
        // map kids per parent
        const childrenByParent = new Map();

        for (const rel of psRows || []) {
          if (!childrenByParent.has(rel.parent_id)) childrenByParent.set(rel.parent_id, []);
          const child = studentsWithoutProfile.find((s) => s.id === rel.student_id);
          if (child) childrenByParent.get(rel.parent_id).push(child);
        }

        parentContacts = (parentProfiles || []).map((p) => {
          const kids = childrenByParent.get(p.id) || [];
          return {
            type: 'parent',
            profile_id: p.id,
            label:
              kids.length > 0
                ? `Rodzic (${kids.map((k) => `${k.first_name} ${k.last_name}`).join(', ')})`
                : 'Rodzic'
          };
        });
      }
    }
  }

  const contacts = [...studentContacts, ...parentContacts].sort((a, b) =>
    a.label.localeCompare(b.label, 'pl')
  );

  return json({ contacts }, { status: 200 });
}
