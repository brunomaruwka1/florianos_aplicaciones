<script>
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    export let data;

    // user pobieramy z serwera
    let user = data.session?.user || null;

    async function logout() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            alert("Błąd podczas wylogowywania: " + error.message);
            return;
        }
        goto('/login');
    }
</script>

<nav class="navbar">
    <div class="logo">Moja Apka</div>

    {#if user}
        <button on:click={logout}>Wyloguj</button>
    {:else}
        <button on:click={() => goto('/login')}>Zaloguj się</button>
    {/if}
</nav>

<slot />
