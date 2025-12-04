export async function load({ locals }) {
    // pobieramy grupy trenera
    const { data: groups, error: groupsErr } = await locals.supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

    // pobieramy uczniów trenera (jeśli chcesz od razu wyświetlać listę)
    const { data: students, error: studentsErr } = await locals.supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

    return {
        groups: groups || [],
        students: students || []
    };
}
