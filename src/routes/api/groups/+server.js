import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
	const supabase = locals.supabase;

	const { data, error } = await supabase
		.from('groups')
		.select('*')
		.order('created_at', { ascending: false });

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json(data);
}

export async function POST({ locals, request }) {
	const supabase = locals.supabase;

	const body = await request.json();
	const { name, description } = body;

	// Sprawdzenie sesji
	const { data: user, error: userError } = await supabase.auth.getUser();
	if (userError || !user) {
		return json({ error: 'Musisz być zalogowany' }, { status: 401 });
	}

	// Walidacja
	if (!name) {
		return json({ error: "Pole 'name' jest wymagane" }, { status: 400 });
	}

	// INSERT z ustawionym created_by
	const { data, error } = await supabase
		.from('groups')
		.insert({
			name,
			description: description ?? null,
			created_by: user.id // <- tutaj pobrany user
		})
		.select();

	if (error) {
		return json({ error: error.message }, { status: 400 });
	}

	return json({ message: 'Grupa dodana!', group: data[0] }, { status: 201 });
}