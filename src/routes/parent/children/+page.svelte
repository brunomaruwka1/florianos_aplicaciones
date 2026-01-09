<script>
  export let data;

  // ➕ dodawanie
  let first_name = '';
  let last_name = '';
  let birth_date = '';
  let error = '';

  // 📋 lista
  let children = data.children || [];

  // ✏️ edycja
  let editingChildId = null;
  let editFirstName = '';
  let editLastName = '';
  let editBirthDate = '';

  // ➕ ADD
  async function addChild() {
    error = '';

    const res = await fetch('/api/parent/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name, last_name, birth_date })
    });

    const dataRes = await res.json();

    if (!res.ok) {
      error = dataRes.error || 'Błąd dodawania dziecka';
      return;
    }

    children = [dataRes.child, ...children];
    first_name = last_name = birth_date = '';
  }

  // ✏️ START EDIT
  function startEdit(child) {
    editingChildId = child.id;
    editFirstName = child.first_name;
    editLastName = child.last_name;
    editBirthDate = child.birth_date;
  }

  function cancelEdit() {
    editingChildId = null;
  }

  // 💾 SAVE EDIT
  async function saveEdit(childId) {
    const res = await fetch(`/api/parent/children/${childId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: editFirstName,
        last_name: editLastName,
        birth_date: editBirthDate
      })
    });

    const dataRes = await res.json();

    if (!res.ok) {
      error = dataRes.error || 'Błąd edycji';
      return;
    }

    children = children.map(c =>
      c.id === childId ? dataRes.child : c
    );

    editingChildId = null;
  }

  // ❌ DELETE
  async function deleteChild(childId) {
    if (!confirm('Na pewno usunąć dziecko?')) return;

    const res = await fetch(`/api/parent/children/${childId}`, {
      method: 'DELETE'
    });

    const dataRes = await res.json();

    if (!res.ok) {
      error = dataRes.error || 'Błąd usuwania';
      return;
    }

    children = children.filter(c => c.id !== childId);
  }
</script>

<div class="max-w-xl mx-auto mt-16 bg-white p-6 rounded-2xl shadow border">

  <h1 class="text-2xl font-bold mb-6">
    Moje dzieci
  </h1>

  <!-- ➕ DODAWANIE -->
  <form on:submit|preventDefault={addChild} class="flex flex-col gap-4 mb-8">
    <input
      bind:value={first_name}
      placeholder="Imię"
      required
      class="px-4 py-2 border rounded-lg"
    />
    <input
      bind:value={last_name}
      placeholder="Nazwisko"
      required
      class="px-4 py-2 border rounded-lg"
    />
    <input
      type="date"
      bind:value={birth_date}
      required
      class="px-4 py-2 border rounded-lg"
    />

    <button
      class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Dodaj
    </button>

    {#if error}
      <p class="text-red-600 text-sm">{error}</p>
    {/if}
  </form>

  <!-- 📋 LISTA -->
  <h2 class="text-xl font-semibold mb-3">
    Lista dzieci
  </h2>

  {#if children.length === 0}
    <p>Brak dzieci.</p>
  {:else}
    <ul class="space-y-3">
      {#each children as c}
        <li class="p-4 border rounded-xl">

          {#if editingChildId === c.id}
            <!-- ✏️ EDYCJA -->
            <div class="flex flex-col gap-2">
              <input
                bind:value={editFirstName}
                class="px-3 py-1 border rounded"
              />
              <input
                bind:value={editLastName}
                class="px-3 py-1 border rounded"
              />
              <input
                type="date"
                bind:value={editBirthDate}
                class="px-3 py-1 border rounded"
              />

              <div class="flex gap-2 mt-2">
                <button
                  type="button"
                  class="px-3 py-1 bg-green-600 text-white rounded"
                  on:click={() => saveEdit(c.id)}
                >
                  Zapisz
                </button>
                <button
                  type="button"
                  class="px-3 py-1 bg-gray-300 rounded"
                  on:click={cancelEdit}
                >
                  Anuluj
                </button>
              </div>
            </div>

          {:else}
            <!-- 👤 PODGLĄD -->
            <div class="flex justify-between items-center">
              <div>
                <strong>{c.first_name} {c.last_name}</strong>
                <div class="text-sm text-gray-500">
                  {new Date(c.birth_date).toLocaleDateString()}
                </div>
              </div>

              <div class="flex gap-3">
                <button
                  type="button"
                  class="text-blue-600 text-sm hover:underline"
                  on:click={() => startEdit(c)}
                >
                  Edytuj
                </button>
                <button
                  type="button"
                  class="text-red-600 text-sm hover:underline"
                  on:click={() => deleteChild(c.id)}
                >
                  Usuń
                </button>
              </div>
            </div>
          {/if}

        </li>
      {/each}
    </ul>
  {/if}

</div>
