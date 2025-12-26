import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, locals }) => {
    const supabase = locals.supabase;

    // 1️⃣ Sprawdzenie sesji
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (!user) {
      return fail(401, { error: 'Musisz być zalogowany jako rodzic' });
    }

    // 2️⃣ Sprawdzenie roli
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'parent') {
      return fail(403, { error: 'Tylko rodzic może dodać dziecko' });
    }

    // 3️⃣ Dane z formularza
    const form = await request.formData();
    const first_name = form.get('first_name');
    const last_name = form.get('last_name');
    const birth_date = form.get('birth_date');
    const group_id = form.get('group_id');

    if (!first_name || !last_name || !birth_date) {
      return fail(400, { error: 'Wszystkie pola są wymagane' });
    }

    // 4️⃣ Tworzymy dziecko
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        first_name,
        last_name,
        birth_date,
        group_id: group_id || null
      })
      .select()
      .single();

    if (studentError) {
      return fail(400, { error: studentError.message });
    }

    // 5️⃣ Relacja parent → student
    const { error: linkError } = await supabase
      .from('parent_students')
      .insert({
        parent_id: user.id,
        student_id: student.id
      });

    if (linkError) {
      return fail(400, { error: linkError.message });
    }

    // 6️⃣ Gotowe
    throw redirect(303, '/profile');
  }
};
