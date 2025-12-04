<script>
    async function updateGroup(groupId, name, description) {
        const res = await fetch(`/api/groups/${groupId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });
        const data = await res.json();
        if (!res.ok) alert(data.error);
        else alert('Grupa zaktualizowana!');
    }

    async function deleteGroup(groupId) {
        if (!confirm("Na pewno chcesz usunąć tę grupę?")) return;
        const res = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) alert(data.error);
        else {
            groups = groups.filter(g => g.id !== groupId);
            alert('Grupa usunięta!');
        }
    }
</script>

<!-- Przykład przycisków w liście grup -->
{#each groups as group}
    <li>
        <strong>{group.name}</strong>
        <button on:click={() => updateGroup(group.id, "Nowa nazwa", group.description)}>Edytuj</button>
        <button on:click={() => deleteGroup(group.id)}>Usuń</button>
    </li>
{/each}
