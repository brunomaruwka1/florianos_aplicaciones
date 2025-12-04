<script>
    export let data;
    let groups = data.groups;

    // pola formularza do dodawania nowej grupy
    let name = "";
    let description = "";

    // stany edycji dla każdej grupy
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

<h1>Lista grup</h1>

<!-- FORMULARZ DODAWANIA -->
<form on:submit|preventDefault={addGroup} class="form">
    <input bind:value={name} placeholder="Nazwa grupy" required />
    <textarea bind:value={description} placeholder="Opis grupy (opcjonalnie)" />
    <button type="submit">Dodaj grupę</button>
</form>

<!-- LISTA GRUP -->
{#if groups.length}
    <ul>
        {#each groups as group}
            <li>
                {#if editingGroupId === group.id}
                    <!-- formularz edycji inline -->
                    <input bind:value={editName} placeholder="Nazwa grupy" required />
                    <textarea bind:value={editDescription} placeholder="Opis grupy" />
                    <button on:click={() => saveEdit(group.id)}>Zapisz</button>
                    <button on:click={cancelEditing}>Anuluj</button>
                {:else}
                    <strong>{group.name}</strong><br />
                    {group.description}<br />
                    <small>→ {new Date(group.created_at).toLocaleString()}</small><br />
                    <button on:click={() => startEditing(group)}>Edytuj</button>
                    <button on:click={() => deleteGroup(group.id)}>Usuń</button>
                {/if}
            </li>
        {/each}
    </ul>
{:else}
    <p>Brak grup.</p>
{/if}

<style>
    .form {
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 300px;
    }
    ul {
        list-style: none;
        padding: 0;
    }
    li {
        margin-bottom: 12px;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 6px;
    }
    input, textarea {
        width: 100%;
        margin-bottom: 6px;
        padding: 6px;
        border-radius: 4px;
        border: 1px solid #ccc;
    }
    button {
        margin-right: 6px;
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    button:hover {
        background: #eee;
    }
</style>
