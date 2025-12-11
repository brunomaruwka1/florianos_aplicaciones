<script>
    import { goto } from '$app/navigation';
    export let session;

    let mobileOpen = false;

    async function logout() {
        try {
            const res = await fetch('/api/logout', { method: 'POST' });
            if (!res.ok) {
                const err = await res.json().catch(()=>({}));
                alert('Błąd wylogowania: ' + (err.error || res.status));
                return;
            }

            goto('/logout', { replaceState: true });
			setTimeout(() => location.reload(), 200);

        } catch (e) {
            alert('Błąd logout: ' + e.message);
        }
    }
</script>

<nav class="w-full bg-white/80 backdrop-blur border-b border-gray-200">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        <!-- Logo -->
        <div 
            class="text-xl font-bold cursor-pointer"
            on:click={() => goto('/')}
        >
            Florianos
        </div>

        <!-- DESKTOP MENU -->
        <div class="hidden md:flex items-center gap-4">

            {#if session}

				<span class="text-gray-700 mr-2 hidden sm:inline">
					Zalogowano jako: <strong>{session.user.email}</strong>
				</span>

                <button
                    class="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition"
                    on:click={() => goto('/profile')}
                >
                    Mój profil
                </button>

                <button
                    class="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                    on:click={logout}
                >
                    Wyloguj
                </button>

            {:else}

                <button
                    class="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
                    on:click={() => goto('/login')}
                >
                    Zaloguj się
                </button>
				
				<button class="px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600"
                    on:click={() => goto('/register')}>
                    Rejestracja
                </button>

            {/if}
        </div>

        <!-- MOBILE HAMBURGER -->
        <div class="md:hidden">
            <button 
                class="text-3xl"
                on:click={() => mobileOpen = !mobileOpen}
            >
                {mobileOpen ? "✕" : "☰"}
            </button>
        </div>
    </div>

    <!-- MOBILE MENU -->
    {#if mobileOpen}
        <div class="md:hidden bg-white border-t border-gray-200 flex flex-col p-4 gap-3">

            {#if session}

                <button
                    class="text-left px-2 py-2 rounded-md hover:bg-gray-100"
                    on:click={() => { mobileOpen=false; goto('/profile'); }}
                >
                    Mój profil
                </button>

                <button
                    class="text-left px-2 py-2 rounded-md hover:bg-gray-100"
                    on:click={() => { mobileOpen=false; goto('/groups'); }}
                >
                    Grupy
                </button>

                <button
                    class="text-left px-2 py-2 rounded-md hover:bg-gray-100"
                    on:click={() => { mobileOpen=false; goto('/students'); }}
                >
                    Podopieczni
                </button>

                <button
                    class="text-left px-2 py-2 rounded-md hover:bg-gray-100"
                    on:click={() => { mobileOpen=false; goto('/classes'); }}
                >
                    Zajęcia
                </button>

                <button
                    class="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                    on:click={logout}
                >
                    Wyloguj
                </button>

            {:else}

                <button
                    class="text-left px-2 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                    on:click={() => goto('/login')}
                >
                    Zaloguj się
                </button>

            {/if}

        </div>
    {/if}
</nav>
