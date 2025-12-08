<script>
    import { onMount } from 'svelte';

    let classes = [];
    let groups = [];

    // dodawanie
    let group_id = '';
    let day_of_week = '';
    let start_time = '';
    let end_time = '';

    // edycja
    let editingId = null;
    let edit_group_id = '';
    let edit_day_of_week = '';
    let edit_start_time = '';
    let edit_end_time = '';

    const days = ["Poniedziałek","Wtorek","Środa","Czwartek","Piątek","Sobota","Niedziela"];

    onMount(async () => {
        groups = await (await fetch('/api/groups')).json();
        classes = await (await fetch('/api/classes')).json();
    });

    async function addClass() {
        const res = await fetch('/api/classes', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ group_id, day_of_week, start_time, end_time })
        });

        const data = await res.json();
        if (!res.ok) return alert(data.error);

        classes = [data.class, ...classes];
        group_id = day_of_week = start_time = end_time = '';
    }

    function startEdit(c) {
        editingId = c.id;
        edit_group_id = c.group_id.id;
        edit_day_of_week = c.day_of_week;
        edit_start_time = c.start_time;
        edit_end_time = c.end_time || '';
    }

    async function updateClass() {
        const res = await fetch('/api/classes', {
            method: 'PATCH',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: editingId,
                group_id: edit_group_id,
                day_of_week: edit_day_of_week,
                start_time: edit_start_time,
                end_time: edit_end_time
            })
        });

        const data = await res.json();
        if (!res.ok) return alert(data.error);

        classes = classes.map(c => c.id === editingId ? data.class : c);
        editingId = null;
    }

    async function deleteClass(id) {
        if (!confirm("Usunąć zajęcia?")) return;

        const res = await fetch('/api/classes', {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });

        const data = await res.json();
        if (!res.ok) return alert(data.error);

        classes = classes.filter(c => c.id !== id);
    }
</script>

<h1>Zajęcia</h1>

<form on:submit|preventDefault={addClass} class="form">
    <select bind:value={group_id} required>
        <option value="" disabled>Wybierz grupę</option>
        {#each groups as g}
            <option value={g.id}>{g.name}</option>
        {/each}
    </select>

    <select bind:value={day_of_week} required>
        <option value="" disabled>Wybierz dzień tygodnia</option>
        {#each days as d, i}
            <option value={i}>{d}</option>
        {/each}
    </select>

    <input type="time" bind:value={start_time} required />
    <input type="time" bind:value={end_time} />

    <button>Dodaj zajęcia</button>
</form>

<ul>
    {#each classes as c}
        <li>
            {#if editingId === c.id}
                <select bind:value={edit_group_id}>
                    {#each groups as g}
                        <option value={g.id}>{g.name}</option>
                    {/each}
                </select>

                <select bind:value={edit_day_of_week}>
                    {#each days as d, i}
                        <option value={i}>{d}</option>
                    {/each}
                </select>

                <input type="time" bind:value={edit_start_time} />
                <input type="time" bind:value={edit_end_time} />

                <button on:click={updateClass}>Zapisz</button>
                <button on:click={() => editingId = null}>Anuluj</button>

            {:else}
                {c.group_id.name}: {days[c.day_of_week]} {c.start_time}–{c.end_time}
                <button on:click={() => startEdit(c)}>Edytuj</button>
                <button on:click={() => deleteClass(c.id)}>Usuń</button>
            {/if}
        </li>
    {/each}
</ul>

<style>
.form { display:flex; flex-direction:column; gap:10px; max-width:350px; margin-bottom:20px; }
input, select, button { padding:8px; border-radius:6px; border:1px solid #ccc; }
button { background:#3b82f6; color:white; cursor:pointer; border:none; }
</style>
