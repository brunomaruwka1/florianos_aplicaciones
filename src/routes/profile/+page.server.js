export async function load({ locals }) {
    const supabase = locals.supabase;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            status: 302,
            redirect: '/login'
        };
    }

    // Pobranie roli użytkownika
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (error) {
        return { error: error.message };
    }

    return {
        role: profile.role
    };
}
