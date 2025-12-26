import { json } from '@sveltejs/kit';

/**
 * GET — pobranie studentów (test SELECT)
 */
export async function GET({ locals }) {
    const supabase = locals.supabase;

    const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('SELECT students error:', error);
        return json({ error: error.message }, { status: 400 });
    }

    return json({ students: data }, { status: 200 });
}

/**
 * POST — dodanie studenta (test INSERT)
 */
export async function POST({ locals, request }) {
    const supabase = locals.supabase;

    // sprawdzamy sesję
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    console.log('AUTH USER:', authData?.user);

    if (authErr || !authData?.user) {
        return json({ error: 'Nie jesteś zalogowany' }, { status: 401 });
    }

    const body = await request.json();
    const { first_name, last_name, birth_date } = body;

    if (!first_name || !last_name || !birth_date) {
        return json({ error: 'Brak wymaganych danych' }, { status: 400 });
    }

    const { data: student, error } = await supabase
        .from('students')
        .insert({
            first_name,
            last_name,
            birth_date
        })
        .select()
        .single();

    if (error) {
        console.error('INSERT student error:', error);
        return json({ error: error.message }, { status: 400 });
    }

    return json(
        { message: 'Student dodany', student },
        { status: 201 }
    );
}
