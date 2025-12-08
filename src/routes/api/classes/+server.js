import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
    const supabase = locals.supabase;

    const { data, error } = await supabase
        .from('classes')
        .select('*, group_id(id, name)')
        .order('day_of_week', { ascending: true });

    if (error) return json({ error: error.message }, { status: 500 });
    return json(data, { status: 200 });
}

export async function POST({ locals, request }) {
    const supabase = locals.supabase;

    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) return json({ error: 'Musisz być zalogowany' }, { status: 401 });

    const userId = data.user.id;
    const body = await request.json();
    const { group_id, day_of_week, start_time, end_time } = body;

    if (!group_id || day_of_week === undefined || !start_time)
        return json({ error: 'Brak wymaganych danych' }, { status: 400 });

    const { data: newClass, error } = await supabase
        .from('classes')
        .insert({
            group_id,
            day_of_week,
            start_time,
            end_time: end_time ?? null,
            created_by: userId
        })
        .select();

    if (error) return json({ error: error.message }, { status: 400 });
    return json({ message: 'Zajęcia dodane!', class: newClass[0] }, { status: 201 });
}

// Edycja zajęć
export async function PATCH({ locals, request }) {
    const supabase = locals.supabase;

    const { data, error: e1 } = await supabase.auth.getUser();
    if (e1 || !data.user) return json({ error: "Brak dostępu" }, { status: 401 });

    const userId = data.user.id;
    const body = await request.json();

    const { id, group_id, day_of_week, start_time, end_time } = body;

    if (!id) return json({ error: "Brak id" }, { status: 400 });

    const { data: updated, error } = await supabase
        .from("classes")
        .update({
            group_id,
            day_of_week,
            start_time,
            end_time
        })
        .eq("id", id)
        .eq("created_by", userId)
        .select("*, group_id(id, name)");

    if (error) return json({ error: error.message }, { status: 400 });

    return json({ class: updated[0] });
}


// Usuwanie zajęć
export async function DELETE({ locals, request }) {
    const supabase = locals.supabase;
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) return json({ error: 'Musisz być zalogowany' }, { status: 401 });

    const userId = data.user.id;
    const body = await request.json();
    const { id } = body;

    if (!id) return json({ error: 'Brak id zajęć' }, { status: 400 });

    const { data: deleted, error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id)
        .eq('created_by', userId)
        .select();

    if (error) return json({ error: error.message }, { status: 400 });
    return json({ message: 'Zajęcia usunięte', class: deleted[0] });
}
