<script>
    import { goto } from '$app/navigation';

    function goToGroups() {
        goto('/groups'); // tutaj strona, gdzie później pokażemy grupy użytkownika
    }

    function goToStudents() {
        goto('/students'); // tutaj strona z podopiecznymi
    }

    function goToClasses() {
        goto('/ classes'); // tutaj strona z zajęciami
    }
</script>

<h1>Mój profil</h1>
<p>Wybierz, co chcesz zrobić:</p>

<div class="menu">
    <button on:click={goToGroups}>Moje grupy</button>
    <button on:click={goToStudents}>Moi podopieczni</button>
    <button on:click={goToClasses}>Moje zajęcia</button>
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
