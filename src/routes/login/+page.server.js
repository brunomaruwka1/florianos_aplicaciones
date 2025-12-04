import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    const { data: auth, error } = await locals.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return fail(400, { error: error.message });

    throw redirect(303, '/profile');
  }
};
