<script>
    export let data;

    console.log("STUDENTS DATA:", data.students);
    console.log("GROUPS DATA:", data.groups);

    let students = data.students || [];
    let groups = data.groups || [];

    let first_name = '';
    let last_name = '';
    let birth_date = '';
    let group_id = '';

    async function addStudent() {
        const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ first_name, last_name, birth_date, group_id })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Błąd przy dodawaniu podopiecznego");
            return;
        }

        students = [data.student, ...students];

        first_name = '';
        last_name = '';
        birth_date = '';
        group_id = '';
    }
</script>

<div class="max-w-6xl mx-auto px-4 py-10">

    <h1 class="text-3xl font-bold mb-6">Moi podopieczni</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

        <!-- LEWA KOLUMNA — FORMULARZ -->
        <div class="bg-white p-6 rounded-2xl shadow border border-gray-200 h-fit sticky top-6">

            <h2 class="text-xl font-semibold mb-4">Dodaj podopiecznego</h2>

            <form on:submit|preventDefault={addStudent} class="flex flex-col gap-4">
                
                <input 
                    placeholder="Imię"
                    bind:value={first_name}
                    required
                    class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <input 
                    placeholder="Nazwisko"
                    bind:value={last_name}
                    required
                    class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <input 
                    type="date"
                    bind:value={birth_date}
                    required
                    class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <select
                    bind:value={group_id}
                    required
                    class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="" disabled selected>Wybierz grupę</option>

                    {#each groups as g}
                        <option value={g.id}>{g.name}</option>
                    {/each}
                </select>

                <button 
                    type="submit"
                    class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition w-fit"
                >
                    Dodaj podopiecznego
                </button>
            </form>

        </div>

        <!-- PRAWA KOLUMNA — LISTA STUDENTÓW -->
        <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">

            {#if students.length}

                {#each students as s}

                    <div class="bg-white p-5 rounded-2xl shadow border border-gray-200">

                        <h3 class="text-lg font-bold mb-1">
                            {s.first_name} {s.last_name}
                        </h3>

                        <p class="text-gray-600 mb-1">
                            Data urodzenia: 
                            <span class="font-medium">
                                {new Date(s.birth_date).toLocaleDateString()}
                            </span>
                        </p>

                          <p>Grupa: {s.group_id ? s.group_id.name : 'Brak'}</p>


                    </div>

                {/each}

            {:else}

                <p class="text-gray-600">Brak podopiecznych.</p>

            {/if}

        </div>

    </div>
</div>
