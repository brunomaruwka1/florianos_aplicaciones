<script>
  export let form;
</script>

<div class="max-w-md mx-auto mt-16 bg-white p-6 rounded-2xl shadow border">
  <h1 class="text-2xl font-bold mb-6">Uzupełnij dane</h1>

  <form method="POST" class="flex flex-col gap-4">
    <input
      name="first_name"
      placeholder="Imię"
      required
      class="border px-3 py-2 rounded"
    />

    <input
      name="last_name"
      placeholder="Nazwisko"
      required
      class="border px-3 py-2 rounded"
    />

    <input
      name="birth_date"
      type="date"
      required
      class="border px-3 py-2 rounded"
    />

    <button class="bg-blue-600 text-white py-2 rounded">
      Zapisz
    </button>

    {#if form?.error}
      <p class="text-red-600 text-sm">{form.error}</p>
    {/if}
  </form>
</div>
