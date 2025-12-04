<script>
    export let data;

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

        // dodanie nowego ucznia do listy
        students = [data.student, ...students];

        first_name = '';
        last_name = '';
        birth_date = '';
        group_id = '';
    }
</script>

<h1>Moi podopieczni</h1>

<form on:submit|preventDefault={addStudent} class="form">
    <input placeholder="Imię" bind:value={first_name} required />
    <input placeholder="Nazwisko" bind:value={last_name} required />
    <input type="date" bind:value={birth_date} required />

    <select bind:value={group_id} required>
        <option value="" disabled selected>Wybierz grupę</option>
        {#each groups as g}
            <option value={g.id}>{g.name}</option>
        {/each}
    </select>

    <button type="submit">Dodaj podopiecznego</button>
</form>

<ul>
    {#each students as s}
        <li>{s.first_name} {s.last_name} → {new Date(s.birth_date).toLocaleDateString()}</li>
    {/each}
</ul>

<style>
    .form { display: flex; flex-direction: column; gap: 10px; max-width: 300px; margin-bottom: 20px; }
    input, select, button { padding: 8px; border-radius: 6px; border: 1px solid #ccc; }
    button { background: #3b82f6; color: white; border: none; cursor: pointer; }
</style>
