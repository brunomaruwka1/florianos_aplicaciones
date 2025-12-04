import { json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
    const supabase = locals.supabase;

    // pobieramy dane z requestu
    const body = await request.json();
    const { first_name, last_name, birth_date, group_id } = body;

    // walidacja podstawowa
    if (!first_name || !last_name || !birth_date || !group_id) {
        return json({ error: "Wszystkie pola są wymagane" }, { status: 400 });
    }

    // dodajemy podopiecznego
    const { data, error } = await supabase
        .from('students')
        .insert({ first_name, last_name, birth_date, group_id })
        .select();

    if (error) {
        return json({ error: error.message }, { status: 400 });
    }

    return json({ message: "Podopieczny dodany!", student: data[0] }, { status: 201 });
}
