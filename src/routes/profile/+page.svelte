<script>
    export let data;
    import { goto } from '$app/navigation';

    const role = data.role;

    function goToGroups() {
        goto('/groups');
    }

    function goToStudents() {
        goto('/students');
    }

    function goToClasses() {
        goto('/classes');
    }

    function goToMyChildren() {
        goto('/parents/children');
    }

    function goToMyClasses() {
        goto('/classes/my');
    }

    function goToChildrenClasses() {
        goto('/classes/children');
    }
</script>

<h1>Mój profil</h1>
<p>Wybierz, co chcesz zrobić:</p>

<div class="menu">

    {#if role === 'trainer'}
        <button on:click={goToGroups}>Moje grupy</button>
        <button on:click={goToStudents}>Moi podopieczni</button>
        <button on:click={goToClasses}>Moje zajęcia</button>

    {:else if role === 'parent'}
        <button on:click={goToMyChildren}>Moje dzieci</button>
        <button on:click={goToMyClasses}>Moje zajęcia</button>
        <button on:click={goToChildrenClasses}>Zajęcia moich dzieci</button>

    {:else if role === 'student'}
        <button on:click={goToClasses}>Moje zajęcia</button>
        <button on:click={() => goto('/groups/my')}>Moja grupa</button>

    {:else}
        <p>Nieznana rola użytkownika.</p>
    {/if}

</div>

<style>
    h1 { margin-bottom: 20px; }
    .menu { display: flex; flex-direction: column; gap: 12px; max-width: 300px; }
    button {
        padding: 12px;
        border-radius: 8px;
        border: none;
        background: #3b82f6;
        color: white;
        cursor: pointer;
        font-weight: bold;
        transition: 0.2s;
    }
    button:hover { background: #2563eb; }
</style>
