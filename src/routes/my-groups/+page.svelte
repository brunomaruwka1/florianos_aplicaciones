<script>
  import { goto } from '$app/navigation';

  export let data;

  const student = data.student;
  const groups = data.groups || [];
</script>

<div class="max-w-4xl mx-auto px-4 py-10 space-y-8">

  <!-- HEADER -->
  <div class="flex items-center justify-between flex-wrap gap-4">
    <div>
      <h1 class="text-3xl font-bold">Moje grupy</h1>

      {#if student}
        <p class="text-gray-600 mt-1">
          Zalogowany: <span class="font-semibold">{student.first_name} {student.last_name}</span>
        </p>
      {/if}
    </div>

    <button
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      on:click={() => goto('/my-groups/join')}
    >
      Dołącz tokenem
    </button>
  </div>

  <!-- LISTA GRUP -->
  <div class="bg-white p-6 rounded-2xl shadow border border-gray-200">
    <h2 class="text-xl font-semibold mb-4">Grupy</h2>

    {#if groups.length === 0}
      <p class="text-gray-600">
        Nie jesteś jeszcze w żadnej grupie.
      </p>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each groups as g}
          <div class="p-5 border rounded-2xl">
            <h3 class="text-lg font-bold mb-1">{g.name}</h3>
            <p class="text-gray-600">{g.description || 'Brak opisu'}</p>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
