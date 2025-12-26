<script>
    import { goto } from '$app/navigation'; // NEW

    export let data;
    let groups = data.groups;

    let name = "";
    let description = "";

    let editingGroupId = null;
    let editName = "";
    let editDescription = "";

    async function addGroup() {
        const res = await fetch('/api/groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });

        const newGroup = await res.json();

        if (!res.ok) {
            alert(newGroup.error || "Błąd podczas dodawania grupy");
            return;
        }

        groups = [newGroup.group, ...groups];
        name = "";
        description = "";
    }

    function startEditing(group) {
        editingGroupId = group.id;
        editName = group.name;
        editDescription = group.description;
    }

    function cancelEditing() {
        editingGroupId = null;
        editName = "";
        editDescription = "";
    }

    async function saveEdit(groupId) {
        const res = await fetch(`/api/groups/${groupId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editName, description: editDescription })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Błąd podczas edycji grupy");
            return;
        }

        groups = groups.map(g => g.id === groupId ? data.group : g);
        cancelEditing();
    }

    async function deleteGroup(groupId) {
        if (!confirm("Na pewno chcesz usunąć tę grupę?")) return;

        const res = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' });
        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Błąd podczas usuwania grupy");
            return;
        }

        groups = groups.filter(g => g.id !== groupId);
    }
</script>

<div class="max-w-6xl mx-auto px-4 py-10">

    <h1 class="text-3xl font-bold mb-6">Moje grupy</h1>

    <!-- 2-kolumnowy layout -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

        <!-- LEWA KOLUMNA — FORMULARZ -->
        <div class="bg-white p-6 rounded-2xl shadow border border-gray-200 h-fit sticky top-6">

            <h2 class="text-xl font-semibold mb-4">Dodaj nową grupę</h2>

            <form on:submit|preventDefault={addGroup} class="flex flex-col gap-4">

                <input 
                    bind:value={name}
                    placeholder="Nazwa grupy"
                    required
                    class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <textarea
                    bind:value={description}
                    placeholder="Opis grupy (opcjonalnie)"
                    class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>

                <button
                    type="submit"
                    class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition w-fit"
                >
                    Dodaj grupę
                </button>

            </form>

        </div>

        <!-- PRAWA KOLUMNA — LISTA GRUP -->
        <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">

            {#if groups.length}
                {#each groups as group}
                    <div class="bg-white p-5 rounded-2xl shadow border border-gray-200">

                        {#if editingGroupId === group.id}

                            <input
                                bind:value={editName}
                                class="mb-3 w-full px-4 py-2 border rounded-lg"
                            />

                            <textarea
                                bind:value={editDescription}
                                class="mb-3 w-full px-4 py-2 border rounded-lg"
                            ></textarea>

                            <div class="flex gap-3">
                                <button
                                    on:click={() => saveEdit(group.id)}
                                    class="px-4 py-2 bg-green-600 text-white rounded-lg"
                                >
                                    Zapisz
                                </button>

                                <button
                                    on:click={cancelEditing}
                                    class="px-4 py-2 bg-gray-300 rounded-lg"
                                >
                                    Anuluj
                                </button>
                            </div>

                        {:else}

                            <!-- KLIKALNA NAZWA GRUPY -->
                            <h3
                                class="text-lg font-bold mb-1 cursor-pointer text-blue-600 hover:underline"
                                on:click={() => goto(`/groups/${group.id}`)}   
                            >
                                {group.name}
                            </h3>

                            <p class="text-gray-600 mb-3">
                                {group.description || "Brak opisu"}
                            </p>

                            <p class="text-gray-400 text-sm mb-4">
                                Utworzone: {new Date(group.created_at).toLocaleString()}
                            </p>

                            <div class="flex gap-3 flex-wrap">

                                <!-- NOWY PRZYCISK -->
                                <button
                                    on:click={() => goto(`/groups/${group.id}`)}
                                    class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                >
                                    Podopieczni
                                </button>

                                <button
                                    on:click={() => startEditing(group)}
                                    class="px-4 py-2 bg-yellow-500 text-white rounded-lg"
                                >
                                    Edytuj
                                </button>

                                <button
                                    on:click={() => deleteGroup(group.id)}
                                    class="px-4 py-2 bg-red-500 text-white rounded-lg"
                                >
                                    Usuń
                                </button>
                            </div>

                        {/if}
                    </div>
                {/each}

            {:else}
                <p class="text-gray-600">Brak grup.</p>
            {/if}

        </div>

    </div>
</div>
