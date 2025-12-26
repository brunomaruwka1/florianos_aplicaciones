<script>
  export let data;
</script>

<div class="max-w-md mx-auto mt-16 bg-white p-6 rounded-2xl shadow border border-gray-200">
  <h1 class="text-2xl font-bold mb-4">Dodaj dziecko</h1>

  <form method="POST" class="flex flex-col gap-4">

    <input
      name="first_name"
      placeholder="Imię dziecka"
      required
      class="px-4 py-2 border rounded-lg"
    />

    <input
      name="last_name"
      placeholder="Nazwisko dziecka"
      required
      class="px-4 py-2 border rounded-lg"
    />

    <input
      name="birth_date"
      type="date"
      required
      class="px-4 py-2 border rounded-lg"
    />

    <select
      name="group_id"
      class="px-4 py-2 border rounded-lg"
    >
      <option value="">— brak grupy —</option>
      {#each data.groups ?? [] as g}
        <option value={g.id}>{g.name}</option>
      {/each}
    </select>

    <button
      class="mt-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      Dodaj dziecko
    </button>

    {#if data?.error}
      <p class="text-red-600 text-sm">{data.error}</p>
    {/if}

  </form>
</div>
