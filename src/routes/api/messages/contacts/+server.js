import { json } from '@sveltejs/kit';

/**
 * GET /api/messages/contacts
 *
 * Zwraca listę kontaktów dla trenera:
 * 1) Podopieczni 13+ -> students.profile_id != null -> kontakt student
 * 2) Rodzice dzieci 13- -> parent_student -> kontakt parent (profiles)
 *
 * UWAGA:
 * - NIE używamy żadnego "age" (bo tego nie mamy w tabelach)
 * - rozróżnienie robimy przez profile_id:
 *    - student.profile_id != null => ma konto => można pisać
 *    - student.profile_id == null => nie ma konta => piszemy do rodzica
 */
export async function GET({ locals }) {
  const supabase = locals.supabase;

  // 1) auth
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  // 2) role check
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile?.role) {
    return json({ error: 'Brak profilu/roli użytkownika' }, { status: 400 });
  }

  if (profile.role !== 'trainer') {
    return json({ contacts: [] }, { status: 200 });
  }

  /* --------------------------------------------------
   * 3) trainer_student -> student ids
   * -------------------------------------------------- */
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

  /* --------------------------------------------------
   * 4) fetch students data
   * -------------------------------------------------- */
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

  /* --------------------------------------------------
   * 5) contacts for students 13+ (those with profile)
   * -------------------------------------------------- */
  const studentContacts = studentsWithProfile.map((s) => ({
    type: 'student',
    profile_id: s.profile_id,
    student_id: s.id,
    label: `${s.first_name} ${s.last_name}`.trim(),
    meta: {
      first_name: s.first_name,
      last_name: s.last_name
    }
  }));

  /* --------------------------------------------------
   * 6) parents for children without profile
   *    parent_student -> parent profiles
   * -------------------------------------------------- */
  let parentContacts = [];

  if (studentsWithoutProfile.length > 0) {
    const childIds = studentsWithoutProfile.map((s) => s.id);

    // relacje parent_student (to tu Ci się prawdopodobnie blokuje przez RLS)
    const { data: psRows, error: psErr } = await supabase
      .from('parent_student')
      .select('parent_id, student_id')
      .in('student_id', childIds);

    console.log('childIds:', childIds);
    console.log('psErr:', psErr);
    console.log('psRows:', psRows);


    if (psErr) {
      console.error('parent_student fetch error:', psErr);

      // nie robimy hard fail — tylko nie pokażemy rodziców
      return json(
        {
          error:
            'Nie udało się pobrać parent_student (RLS?): ' + psErr.message,
          contacts: studentContacts
        },
        { status: 200 }
      );
    }

    const parentIds = [...new Set((psRows || []).map((r) => r.parent_id).filter(Boolean))];

    if (parentIds.length > 0) {
      const { data: parentProfiles, error: parentErr } = await supabase
        .from('profiles')
        .select('id, role')
        .in('id', parentIds);

      if (parentErr) {
        console.error('parent profiles fetch error:', parentErr);
      } else {
        // map children list per parent
        const childrenByParent = new Map();

        for (const rel of psRows || []) {
          if (!childrenByParent.has(rel.parent_id)) {
            childrenByParent.set(rel.parent_id, []);
          }

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
                ? `Rodzic: ${kids.map((k) => `${k.first_name} ${k.last_name}`).join(', ')}`
                : 'Rodzic',
            meta: {
              children: kids.map((k) => ({
                id: k.id,
                first_name: k.first_name,
                last_name: k.last_name
              }))
            }
          };
        });
      }
    }
  }

  /* --------------------------------------------------
   * 7) merge & return
   * -------------------------------------------------- */
  const contacts = [...studentContacts, ...parentContacts].sort((a, b) =>
    a.label.localeCompare(b.label, 'pl')
  );

  return json({ contacts }, { status: 200 });
}
