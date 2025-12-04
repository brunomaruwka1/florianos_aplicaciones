import { json } from '@sveltejs/kit';

export async function PATCH({ locals, request, params }) {
    const supabase = locals.supabase;
    const { id } = params;

    if (!locals.session) {
        return json({ error: 'Musisz być zalogowany' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
        return json({ error: "Pole 'name' jest wymagane" }, { status: 400 });
    }

    // aktualizacja grupy
    const { data, error } = await supabase
        .from('groups')
        .update({ name, description })
        .eq('id', id)
        .select();

    if (error) {
        return json({ error: error.message }, { status: 400 });
    }

    return json({ message: 'Grupa zaktualizowana!', group: data[0] });
}

export async function DELETE({ locals, params }) {
    const supabase = locals.supabase;
    const { id } = params;

    if (!locals.session) {
        return json({ error: 'Musisz być zalogowany' }, { status: 401 });
    }

    // usunięcie grupy
    const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

    if (error) {
        return json({ error: error.message }, { status: 400 });
    }

    return json({ message: 'Grupa usunięta!' });
}
