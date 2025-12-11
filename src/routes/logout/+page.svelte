<script>
    import { goto } from "$app/navigation";
</script>

<div class="mx-auto m-30 bg-white shadow-md border rounded-xl p-8 text-center max-w-md">
    <h1 class="text-2xl font-bold mb-2">Wylogowano pomyślnie</h1>
    <p class="text-gray-600 mb-6">
        Zostałeś poprawnie wylogowany z systemu.
    </p>

    <button
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        on:click={() => goto('/login')}
    >
        Przejdź do logowania
    </button>
</div>

