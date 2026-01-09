import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, locals }) => {
    const supabase = locals.supabase;

    // 1️⃣ auth
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    const user = authData?.user;

    if (authErr || !user) {
      return fail(401, { error: 'Brak autoryzacji' });
    }

    // 2️⃣ formularz
    const formData = await request.formData();
    const first_name = formData.get('first_name');
    const last_name = formData.get('last_name');
    const birth_date = formData.get('birth_date');

    if (!first_name || !last_name || !birth_date) {
      return fail(400, { error: 'Uzupełnij wszystkie pola' });
    }

    // 3️⃣ czy student już istnieje?
    const { data: existingStudent, error: checkErr } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (checkErr) {
      return fail(400, { error: checkErr.message });
    }

    if (existingStudent) {
      throw redirect(303, '/dashboard');
    }

    // 4️⃣ insert students (AKTYWACJA)
    const { error: studentErr } = await supabase
      .from('students')
      .insert({
        first_name,
        last_name,
        birth_date,
        profile_id: user.id,
        created_by: user.id
      });

    if (studentErr) {
      return fail(400, { error: studentErr.message });
    }

    // 5️⃣ sukces
    throw redirect(303, '/profile');
  }
};
