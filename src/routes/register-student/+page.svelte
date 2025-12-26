<script>
  export let form;
</script>

<div class="max-w-md mx-auto mt-16 bg-white p-6 rounded-2xl shadow border border-gray-200">
  <h1 class="text-2xl font-bold mb-6">Rejestracja podopiecznego (13+)</h1>

  <form method="POST" class="flex flex-col gap-4">

    <input
      name="email"
      type="email"
      placeholder="Email"
      required
      class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
    />

    <input
      name="password"
      type="password"
      placeholder="Hasło"
      required
      class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
    />

    <input
      name="first_name"
      placeholder="Imię"
      required
      class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
    />

    <input
      name="last_name"
      placeholder="Nazwisko"
      required
      class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
    />

    <input
      name="birth_date"
      type="date"
      required
      class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
    />

    <button
      type="submit"
      class="mt-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
    >
      Utwórz konto
    </button>

    {#if form?.error}
      <p class="text-red-600 text-sm">{form.error}</p>
    {/if}

  </form>
</div>
