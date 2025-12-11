// src/routes/api/logout/+server.js
import { json } from "@sveltejs/kit";

export async function POST({ locals, cookies }) {
    const supabase = locals.supabase;

    // wylogowanie po stronie Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
        return json({ error: error.message }, { status: 400 });
    }

    // Kasujemy ciasteczka
    cookies.set("sb-access-token", "", {
        path: "/",
        maxAge: 0
    });

    cookies.set("sb-refresh-token", "", {
        path: "/",
        maxAge: 0
    });

    return json({ message: "Logged out" }, { status: 200 });
}
