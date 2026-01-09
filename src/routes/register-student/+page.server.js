import { redirect, fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, locals }) => {
    const supabase = locals.supabase;
    const data = await request.formData();

    const email = data.get('email');
    const password = data.get('password');

    if (!email || !password) {
      return fail(400, { error: 'Uzupełnij dane' });
    }

    // 1️⃣ Auth
    const { data: authData, error: authErr } =
      await supabase.auth.signUp({ email, password });

    if (authErr) {
      return fail(400, { error: authErr.message });
    }

    const userId = authData.user.id;

    // 2️⃣ Profil
    const { error: profileErr } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        role: 'student'
      });

    if (profileErr) {
      return fail(400, { error: profileErr.message });
    }

    throw redirect(303, '/complete-profile');
  }
};
