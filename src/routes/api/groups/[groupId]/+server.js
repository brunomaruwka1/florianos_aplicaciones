import { json } from '@sveltejs/kit';

export async function PATCH({ locals, request, params }) {
    const supabase = locals.supabase;
    const { groupId } = params;

    if (!locals.session) {
        return json({ error: 'Musisz być zalogowany' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
        return json({ error: "Pole 'name' jest wymagane" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('groups')
        .update({ name, description })
        .eq('id', groupId)
        .select()
        .single();

    if (error) {
        return json({ error: error.message }, { status: 400 });
    }

    return json({ message: 'Grupa zaktualizowana!', group: data });
}

export async function DELETE({ locals, params }) {
    const supabase = locals.supabase;
    const { groupId } = params;

    if (!locals.session) {
        return json({ error: 'Musisz być zalogowany' }, { status: 401 });
    }

    const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

    if (error) {
        return json({ error: error.message }, { status: 400 });
    }

    return json({ message: 'Grupa usunięta!' });
}
