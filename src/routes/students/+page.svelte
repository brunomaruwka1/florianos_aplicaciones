<script>
    import { onMount } from 'svelte';

    // ➕ dodawanie
    let first_name = '';
    let last_name = '';
    let birth_date = '';
    let error = '';

    // 📋 lista
    let students = [];
    let loading = true;

    // ✏️ edycja
    let editingStudentId = null;
    let editFirstName = '';
    let editLastName = '';
    let editBirthDate = '';

    // 📥 LOAD
    async function loadStudents() {
        loading = true;
        error = '';

        const res = await fetch('/api/students');
        const data = await res.json();

        if (!res.ok) {
            error = data.error || 'Błąd pobierania studentów';
        } else {
            students = data.students || [];
        }

        loading = false;
    }

    // ➕ ADD
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

        first_name = '';
        last_name = '';
        birth_date = '';

        await loadStudents();
    }

    // ✏️ START EDIT
    function startEdit(student) {
        editingStudentId = student.id;
        editFirstName = student.first_name;
        editLastName = student.last_name;
        editBirthDate = student.birth_date;
    }

    function cancelEdit() {
        editingStudentId = null;
    }

    // 💾 SAVE EDIT
    async function saveEdit(studentId) {
        const res = await fetch(`/api/students/${studentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: editFirstName,
                last_name: editLastName,
                birth_date: editBirthDate
            })
        });

        const data = await res.json();

        if (!res.ok) {
            error = data.error || 'Błąd edycji';
            return;
        }

        editingStudentId = null;
        await loadStudents();
    }

    // ❌ DELETE
    async function deleteStudent(studentId) {
        if (!confirm('Na pewno usunąć podopiecznego?')) return;

        const res = await fetch(`/api/students/${studentId}`, {
            method: 'DELETE'
        });

        const data = await res.json();

        if (!res.ok) {
            error = data.error || 'Błąd usuwania';
            return;
        }

        await loadStudents();
    }

    onMount(loadStudents);
</script>

<div class="max-w-xl mx-auto mt-16 bg-white p-6 rounded-2xl shadow border">

    <h1 class="text-2xl font-bold mb-6">
        Podopieczni
    </h1>

    <!-- ➕ DODAWANIE -->
    <form on:submit|preventDefault={addStudent} class="flex flex-col gap-4 mb-8">
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
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            Dodaj
        </button>

        {#if error}
            <p class="text-red-600 text-sm">{error}</p>
        {/if}
    </form>

    <!-- 📋 LISTA -->
    <h2 class="text-xl font-semibold mb-3">
        Lista podopiecznych
    </h2>

    {#if loading}
        <p>Ładowanie…</p>
    {:else if students.length === 0}
        <p>Brak studentów.</p>
    {:else}
        <ul class="space-y-3">
            {#each students as s}
                <li class="p-4 border rounded-xl">

                    {#if editingStudentId === s.id}
                        <!-- ✏️ EDYCJA -->
                        <div class="flex flex-col gap-2">
                            <input
                                bind:value={editFirstName}
                                class="px-3 py-1 border rounded"
                            />
                            <input
                                bind:value={editLastName}
                                class="px-3 py-1 border rounded"
                            />
                            <input
                                type="date"
                                bind:value={editBirthDate}
                                class="px-3 py-1 border rounded"
                            />

                            <div class="flex gap-2 mt-2">
                                <button
                                    type="button"
                                    class="px-3 py-1 bg-green-600 text-white rounded"
                                    on:click={() => saveEdit(s.id)}
                                >
                                    Zapisz
                                </button>
                                <button
                                    type="button"
                                    class="px-3 py-1 bg-gray-300 rounded"
                                    on:click={cancelEdit}
                                >
                                    Anuluj
                                </button>
                            </div>
                        </div>

                    {:else}
                        <!-- 👤 PODGLĄD -->
                        <div class="flex justify-between items-center">
                            <div>
                                <strong>{s.first_name} {s.last_name}</strong>
                                <div class="text-sm text-gray-500">
                                    {new Date(s.birth_date).toLocaleDateString()}
                                </div>
                            </div>

                            <div class="flex gap-3">
                                <button
                                    type="button"
                                    class="text-blue-600 text-sm hover:underline"
                                    on:click={() => startEdit(s)}
                                >
                                    Edytuj
                                </button>
                                <button
                                    type="button"
                                    class="text-red-600 text-sm hover:underline"
                                    on:click={() => deleteStudent(s.id)}
                                >
                                    Usuń
                                </button>
                            </div>
                        </div>
                    {/if}

                </li>
            {/each}
        </ul>
    {/if}
</div>
