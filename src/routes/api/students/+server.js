import { json } from '@sveltejs/kit';

/**
 * GET — lista studentów zalogowanego użytkownika
 * (na razie tylko created_by — OK na tym etapie)
 */
export async function GET({ locals }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();

  if (authErr || !authData?.user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const userId = authData.user.id;

  const { data, error } = await supabase
    .from('students')
    .select('id, first_name, last_name, birth_date, created_at')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('GET students error:', error);
    return json({ error: error.message }, { status: 400 });
  }

  return json({ students: data }, { status: 200 });
}

/**
 * POST — dodanie studenta
 * - parent → tylko student
 * - trainer → student + relacja trainer_student
 */
export async function POST({ locals, request }) {
  const supabase = locals.supabase;

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    return json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const { first_name, last_name, birth_date } = await request.json();

  if (!first_name || !last_name || !birth_date) {
    return json({ error: 'Brak wymaganych danych' }, { status: 400 });
  }

  /* --------------------------------------------------
   * 1️⃣ DODAJEMY STUDENTA
   * -------------------------------------------------- */
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .insert({
      first_name,
      last_name,
      birth_date,
      created_by: user.id
    })
    .select()
    .single();

  if (studentErr) {
    console.error('Student insert error:', studentErr);
    return json({ error: studentErr.message }, { status: 400 });
  }

  /* --------------------------------------------------
   * 2️⃣ SPRAWDZAMY CZY USER JEST TRENEREM
   * trainers.profile_id = auth.uid()
   * -------------------------------------------------- */
  const { data: trainer, error: trainerErr } = await supabase
    .from('trainers')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle(); // ✅ brak błędu jeśli to parent

  if (trainerErr) {
    console.error('Trainer check error:', trainerErr);
  }

  /* --------------------------------------------------
   * 3️⃣ JEŚLI TRENER → TWORZYMY RELACJĘ
   * UWAGA: używamy trainers.id
   * -------------------------------------------------- */
  if (trainer) {
    const {
      data: relation,
      error: relationErr
    } = await supabase
      .from('trainer_student')
      .insert({
        trainer_id: trainer.id, // 🔥 KLUCZOWA ZMIANA
        student_id: student.id
      })
      .select()
      .single();

    console.log('TRAINER_STUDENT RESULT:', relation, relationErr);

    if (relationErr) {
      console.error('Relation insert error:', relationErr);
      // nie cofamy studenta — relacja jest opcjonalna
    }
  }

  return json({ student }, { status: 201 });
}
