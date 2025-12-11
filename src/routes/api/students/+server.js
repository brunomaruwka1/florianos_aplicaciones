import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
    const supabase = locals.supabase;

    const { data, error } = await supabase
        .from("students")
        .select("*, group_id(id, name)")
        .order("created_at", { ascending: false });

    if (error) {
        return json({ error: error.message }, { status: 400 });
    }

    return json(data, { status: 200 });
}

export async function POST({ locals, request }) {
    const supabase = locals.supabase;

    const body = await request.json();
    const { first_name, last_name, birth_date, group_id } = body;

    if (!first_name || !last_name || !birth_date || !group_id) {
        return json({ error: "Wszystkie pola są wymagane" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('students')
        .insert({ first_name, last_name, birth_date, group_id })
        .select('*, group_id(id, name)')
        .single();

    if (error) {
        return json({ error: error.message }, { status: 400 });
    }

    return json({ message: "Podopieczny dodany!", student: data }, { status: 201 });
}
