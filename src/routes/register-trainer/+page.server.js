import { redirect, fail } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    const email = data.get('email');
    const password = data.get('password');
    const first_name = data.get('first_name');
    const last_name = data.get('last_name');
    const birth_date = data.get('birth_date');

    // 1) Rejestracja użytkownika w Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpError) {
      return fail(400, { error: signUpError.message });
    }

    const userId = authData?.user?.id;

    // 2) Tworzenie rekordu w profiles
    const { error: profileErr } = await supabase
      .from('profiles')
      .insert({ id: userId, role: 'trainer' });

    if (profileErr) {
      return fail(400, { error: profileErr.message });
    }

    // 3) Tworzenie rekordu w trainers
    const { error: trainerErr } = await supabase
      .from('trainers')
      .insert({
        profile_id: userId,
        email,
        first_name,
        last_name,
        birth_date
      });

    if (trainerErr) {
      return fail(400, { error: trainerErr.message });
    }

    // ZSUCCESCO — redirect na /login
    throw redirect(303, '/login');
  }
};
