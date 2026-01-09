<script>
  export let form;
</script>

<div class="max-w-md mx-auto mt-16 bg-white p-6 rounded-2xl shadow border">
  <h1 class="text-2xl font-bold mb-6">Rejestracja</h1>

  <form method="POST" class="flex flex-col gap-4">
    <input
      name="email"
      type="email"
      placeholder="Email"
      required
      class="px-4 py-2 border rounded-lg"
    />

    <input
      name="password"
      type="password"
      placeholder="Hasło"
      required
      class="px-4 py-2 border rounded-lg"
    />

    <button class="bg-blue-600 text-white py-2 rounded-lg">
      Dalej
    </button>

    {#if form?.error}
      <p class="text-red-600 text-sm">{form.error}</p>
    {/if}
  </form>
</div>
