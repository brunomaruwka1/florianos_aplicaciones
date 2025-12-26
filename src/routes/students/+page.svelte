<script>
    import { onMount } from 'svelte';

    let first_name = '';
    let last_name = '';
    let birth_date = '';
    let error = '';

    let students = [];
    let loading = true;

    async function loadStudents() {
        loading = true;
        error = '';

        const res = await fetch('/api/students');
        const data = await res.json();

        if (!res.ok) {
            console.error('LOAD students error:', data);
            error = data.error || 'Błąd pobierania studentów';
        } else {
            students = data.students || [];
        }

        loading = false;
    }

    async function addStudent() {
        error = '';

        const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name,
                last_name,
                birth_date
            })
        });

        const data = await res.json();

        if (!res.ok) {
            error = data.error || 'Błąd podczas dodawania';
            return;
        }

        // reset formularza
        first_name = '';
        last_name = '';
        birth_date = '';

        // odśwież listę
        loadStudents();
    }

    onMount(loadStudents);
</script>

<div class="max-w-md mx-auto mt-16 bg-white p-6 rounded-2xl shadow border border-gray-200">

    <h1 class="text-2xl font-bold mb-6">
        Dodaj podopiecznego (TEST)
    </h1>

    <form
        on:submit|preventDefault={addStudent}
        class="flex flex-col gap-4"
    >
        <input
            bind:value={first_name}
            placeholder="Imię"
            required
            class="px-4 py-2 border rounded-lg"
        />

        <input
            bind:value={last_name}
            placeholder="Nazwisko"
            required
            class="px-4 py-2 border rounded-lg"
        />

        <input
            type="date"
            bind:value={birth_date}
            required
            class="px-4 py-2 border rounded-lg"
        />

        <button
            type="submit"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            Dodaj
        </button>

        {#if error}
            <p class="text-red-600 text-sm">{error}</p>
        {/if}
    </form>

    <hr class="my-6" />

    <h2 class="text-xl font-semibold mb-3">
        Istniejący podopieczni
    </h2>

    {#if loading}
        <p>Ładowanie…</p>
    {:else if students.length === 0}
        <p>Brak studentów w bazie.</p>
    {:else}
        <ul class="space-y-2">
            {#each students as s}
                <li class="p-3 border rounded-lg">
                    <strong>{s.first_name} {s.last_name}</strong>
                    <div class="text-sm text-gray-500">
                        {s.birth_date}
                    </div>
                </li>
            {/each}
        </ul>
    {/if}

</div>
