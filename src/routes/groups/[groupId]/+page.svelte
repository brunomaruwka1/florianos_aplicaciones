<script>
  export let data;

  const { group, groupStudents, allStudents } = data;

  let first_name = '';
  let last_name = '';
  let birth_date = '';
  let existingStudentId = '';
  let error = '';

  // ➕ nowy student + przypisanie do tej grupy
  async function addNewStudent() {
    error = '';

    const res = await fetch(`/api/groups/${group.id}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name, last_name, birth_date })
    });

    const data = await res.json();
    if (!res.ok) {
      error = data.error || 'Błąd dodawania';
      return;
    }

    location.reload();
  }

  // 🔗 przypisz istniejącego studenta
  async function assignStudent() {
    if (!existingStudentId) return;

    const res = await fetch(`/api/groups/${group.id}/assign-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: existingStudentId })
    });

    const data = await res.json();
    if (!res.ok) {
      error = data.error || 'Błąd przypisywania';
      return;
    }

    location.reload();
  }

  // ❌ USUŃ studenta z grupy
  async function removeFromGroup(studentId) {
    if (!confirm('Usunąć podopiecznego z tej grupy?')) return;

    const res = await fetch(
      `/api/groups/${group.id}/students/${studentId}`,
      { method: 'DELETE' }
    );

    const data = await res.json();
    if (!res.ok) {
      error = data.error || 'Błąd usuwania';
      return;
    }

    location.reload();
  }
</script>

<div class="max-w-6xl mx-auto px-4 py-10 space-y-10">

  <!-- 🔹 HEADER -->
  <div>
    <h1 class="text-3xl font-bold">{group.name}</h1>
    <p class="text-gray-600">{group.description}</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

    <!-- 🧒 STUDENCI W GRUPIE -->
    <div class="bg-white p-6 rounded-2xl shadow border">
      <h2 class="text-xl font-semibold mb-4">Podopieczni w grupie</h2>

      {#if groupStudents.length === 0}
        <p class="text-gray-500">
          Brak podopiecznych w tej grupie.
        </p>
      {:else}
        <ul class="space-y-3">
          {#each groupStudents as s}
            <li class="p-4 border rounded-xl flex items-center justify-between">
              <div>
                <p class="font-semibold">
                  {s.first_name} {s.last_name}
                </p>
                <p class="text-sm text-gray-500">
                  Data urodzenia: {new Date(s.birth_date).toLocaleDateString()}
                </p>
              </div>

              
              <button class="p-2 text-gray-500 hover:text-red-600 transition" on:click={() => removeFromGroup(s.id)}>
                <svg xmlns="http://www.w3.org/2000/svg"
                    class="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2">
                  <path stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m3-3h4a1 1 0 011 1v1H8V5a1 1 0 011-1z" />
                </svg>
              </button>

            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <!-- ➕ ZARZĄDZANIE -->
    <div class="space-y-6">

      <!-- NOWY STUDENT -->
      <div class="bg-white p-6 rounded-2xl shadow border">
        <h3 class="font-semibold mb-3">Dodaj nowego podopiecznego</h3>

        <div class="flex flex-col gap-3">
          <input bind:value={first_name} placeholder="Imię" class="px-4 py-2 border rounded-lg" />
          <input bind:value={last_name} placeholder="Nazwisko" class="px-4 py-2 border rounded-lg" />
          <input type="date" bind:value={birth_date} class="px-4 py-2 border rounded-lg" />

          <button
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            on:click={addNewStudent}
          >
            Dodaj i przypisz
          </button>
        </div>
      </div>

      <!-- ISTNIEJĄCY STUDENT -->
      <div class="bg-white p-6 rounded-2xl shadow border">
        <h3 class="font-semibold mb-3">Przypisz istniejącego</h3>

        <select
          bind:value={existingStudentId}
          class="w-full px-4 py-2 border rounded-lg mb-3"
        >
          <option value="">— wybierz —</option>
          {#each allStudents as s}
            <option value={s.id}>
              {s.first_name} {s.last_name}
            </option>
          {/each}
        </select>

        <button
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          on:click={assignStudent}
        >
          Przypisz do grupy
        </button>
      </div>

      {#if error}
        <p class="text-red-600 text-sm">{error}</p>
      {/if}

    </div>
  </div>
</div>
