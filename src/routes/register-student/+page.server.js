import { fail, redirect } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export const actions = {
  default: async ({ request }) => {
    const form = await request.formData();

    const email = form.get('email');
    const password = form.get('password');
    const first_name = form.get('first_name');
    const last_name = form.get('last_name');
    const birth_date = form.get('birth_date');

    if (!email || !password || !first_name || !last_name || !birth_date) {
      return fail(400, { error: 'Wszystkie pola są wymagane' });
    }

    // 🔥 WALIDACJA WIEKU
    const age = calculateAge(birth_date);

    if (age < 13) {
      return fail(403, {
        underage: true,
        error: 'Osoba poniżej 13 roku życia nie może samodzielnie założyć konta.'
      });
    }

    // 1️⃣ Rejestracja Auth
    const { data: authData, error: authError } =
      await supabase.auth.signUp({ email, password });

    if (authError) {
      return fail(400, { error: authError.message });
    }

    const userId = authData.user.id;

    // 2️⃣ Profil
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: userId, role: 'student' });

    if (profileError) {
      return fail(400, { error: profileError.message });
    }

    // 3️⃣ Student
    const { error: studentError } = await supabase
      .from('students')
      .insert({
        id: userId,
        first_name,
        last_name,
        birth_date
      });

    if (studentError) {
      return fail(400, { error: studentError.message });
    }

    throw redirect(303, '/login');
  }
};
