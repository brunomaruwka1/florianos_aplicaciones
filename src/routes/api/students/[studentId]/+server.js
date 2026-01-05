import { json } from '@sveltejs/kit';

/**
 * PATCH — edycja studenta
 */
export async function PATCH({ locals, params, request }) {
    const supabase = locals.supabase;
    const { studentId } = params;

    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) {
        return json({ error: 'Brak autoryzacji' }, { status: 401 });
    }

    const { first_name, last_name, birth_date } = await request.json();

    if (!first_name || !last_name || !birth_date) {
        return json({ error: 'Brak wymaganych danych' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('students')
        .update({ first_name, last_name, birth_date })
        .eq('id', studentId)
        .select()
        

    console.log('EDIT studentId:', studentId);
    console.log('UPDATE result:', data);


    if (error) {
        return json({ error: error.message }, { status: 400 });
        }

        return json({
        message: 'Student zaktualizowany',
        student: data[0] // 👈 pierwszy element
});

}

/**
 * DELETE — usunięcie studenta
 */
export async function DELETE({ locals, params }) {
    const supabase = locals.supabase;
    const { studentId } = params;

    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) {
        return json({ error: 'Brak autoryzacji' }, { status: 401 });
    }

    const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

    if (error) {
        return json({ error: error.message }, { status: 400 });
    }

    return json({ success: true });
}
