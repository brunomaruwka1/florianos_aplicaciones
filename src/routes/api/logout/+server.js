export async function POST({ cookies }) {
	// wyczyszczenie tokenów supabase z cookies
	cookies.set('sb-access-token', '', {
		path: '/',
		maxAge: 0
	});

	cookies.set('sb-refresh-token', '', {
		path: '/',
		maxAge: 0
	});

	return new Response(null, { status: 204 });
}
