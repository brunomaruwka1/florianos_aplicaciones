<script>
  export let form;
</script>


  <div class="m-20 mx-auto w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-gray-200">

    <h1 class="text-2xl font-bold mb-2 text-center">Logowanie</h1>
    <p class="text-gray-600 text-center mb-6">Zaloguj się, aby kontynuować</p>

    <form method="POST" class="flex flex-col gap-4">

      <div>
        <label class="block mb-1 font-medium">Email</label>
        <input
          type="email"
          name="email"
          required
          class="w-full px-4 py-2 border rounded-lg 
                 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label class="block mb-1 font-medium">Hasło</label>
        <input
          type="password"
          name="password"
          required
          class="w-full px-4 py-2 border rounded-lg 
                 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {#if form?.error}
        <p class="text-red-600 bg-red-100 px-3 py-2 rounded-lg text-sm">
          {form.error}
        </p>
      {/if}

      <button
        type="submit"
        class="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg
               hover:bg-blue-700 transition"
      >
        Zaloguj się
      </button>

      <p class="text-center text-sm text-gray-600">
        Nie masz konta?
        <a href="/register" class="text-blue-600 hover:underline">Zarejestruj się</a>
      </p>

    </form>

  </div>

