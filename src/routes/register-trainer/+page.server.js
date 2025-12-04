import { redirect, fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();

    const email = form.get('email');
    const password = form.get('password');
    const first_name = form.get('first_name');
    const last_name = form.get('last_name');
    const birth_date = form.get('birth_date');

    const { data: auth, error } = await locals.supabase.auth.signUp({
      email,
      password
    });

    if (error) return fail(400, { error: error.message });

    const userId = auth.user.id;

    const { error: profileErr } = await locals.supabase
      .from('profiles')
      .insert({ id: userId, role: 'trainer' });

    if (profileErr) return fail(400, { error: profileErr.message });

    const { error: trainerErr } = await locals.supabase
      .from('trainers')
      .insert({
        profile_id: userId,
        email,
        first_name,
        last_name,
        birth_date
      });

    if (trainerErr) return fail(400, { error: trainerErr.message });

    throw redirect(303, '/login');
  }
};
