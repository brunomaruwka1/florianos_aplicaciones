<script>
  import { goto } from "$app/navigation";
  export let data;

  let first_name = "";
  let last_name = "";
  let birth_date = "";
  let error = "";

  let children = data.children || [];

  let editingChildId = null;
  let editFirstName = "";
  let editLastName = "";
  let editBirthDate = "";

  let joinModalOpen = false;
  let joinChild = null;
  let joinToken = "";
  let joinError = "";
  let joinSuccess = "";
  let joinLoading = false;

  async function addChild() {
    error = "";

    const res = await fetch("/api/parent/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name, last_name, birth_date }),
    });

    const dataRes = await res.json();

    if (!res.ok) {
      error = dataRes.error || "Błąd dodawania dziecka";
      return;
    }

    children = [dataRes.child, ...children];
    first_name = last_name = birth_date = "";
  }

  function startEdit(child) {
    editingChildId = child.id;
    editFirstName = child.first_name;
    editLastName = child.last_name;
    editBirthDate = child.birth_date;
  }

  function cancelEdit() {
    editingChildId = null;
  }

  async function saveEdit(childId) {
    const res = await fetch(`/api/parent/children/${childId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: editFirstName,
        last_name: editLastName,
        birth_date: editBirthDate,
      }),
    });

    const dataRes = await res.json();

    if (!res.ok) {
      error = dataRes.error || "Błąd edycji";
      return;
    }

    children = children.map((c) => (c.id === childId ? dataRes.child : c));
    editingChildId = null;
  }

  async function deleteChild(childId) {
    if (!confirm("Na pewno usunąć dziecko?")) return;

    const res = await fetch(`/api/parent/children/${childId}`, {
      method: "DELETE",
    });

    const dataRes = await res.json();

    if (!res.ok) {
      error = dataRes.error || "Błąd usuwania";
      return;
    }

    children = children.filter((c) => c.id !== childId);
  }

  function openJoinModal(child) {
    joinChild = child;
    joinToken = "";
    joinError = "";
    joinSuccess = "";
    joinLoading = false;
    joinModalOpen = true;
  }

  function closeJoinModal() {
    joinModalOpen = false;
    joinChild = null;
    joinToken = "";
    joinError = "";
    joinSuccess = "";
    joinLoading = false;
  }

  async function joinGroupForChild() {
    joinError = "";
    joinSuccess = "";

    if (!joinToken.trim()) {
      joinError = "Wklej token od trenera.";
      return;
    }

    joinLoading = true;

    const res = await fetch(`/api/parent/children/${joinChild.id}/join-group`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: joinToken }),
    });

    const out = await res.json();
    joinLoading = false;

    if (!res.ok) {
      joinError = out.error || "Błąd dołączania do grupy";
      return;
    }

    joinSuccess = "Dziecko dołączone do grupy";
    setTimeout(closeJoinModal, 900);
  }
</script>

<div class="max-w-xl mx-auto mt-16 bg-white p-6 rounded-2xl shadow border">
  <h1 class="text-2xl font-bold mb-6">Moje dzieci</h1>

  <!-- DODAWANIE -->
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

  <!-- LISTA -->
  <h2 class="text-xl font-semibold mb-3">Lista dzieci</h2>

  {#if children.length === 0}
    <p>Brak dzieci.</p>
  {:else}
    <ul class="space-y-3">
      {#each children as c}
        <li class="p-4 border rounded-xl">
          {#if editingChildId === c.id}
            <!-- EDYCJA -->
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
                  class="px-3 py-1 bg-green-600 text-white rounded"
                  on:click={() => saveEdit(c.id)}
                >
                  Zapisz
                </button>
                <button
                  class="px-3 py-1 bg-gray-300 rounded"
                  on:click={cancelEdit}
                >
                  Anuluj
                </button>
              </div>
            </div>
          {:else}
            <!-- PODGLĄD -->
            <div class="flex justify-between items-center gap-4">
              <div>
                <button
                  class="font-semibold text-left hover:underline"
                  on:click={() => goto(`/parent/children/${c.id}`)}
                >
                  {c.first_name}
                  {c.last_name}
                </button>

                <div class="text-sm text-gray-500">
                  {new Date(c.birth_date).toLocaleDateString()}
                </div>
              </div>

              <div class="flex gap-3 flex-wrap justify-end">
                <button
                  class="text-indigo-600 text-sm hover:underline"
                  on:click={() => goto(`/parent/children/${c.id}`)}
                >
                  Szczegóły
                </button>

                <button
                  class="text-green-600 text-sm hover:underline"
                  on:click={() => openJoinModal(c)}
                >
                  Dołącz do grupy
                </button>

                <button
                  class="text-blue-600 text-sm hover:underline"
                  on:click={() => startEdit(c)}
                >
                  Edytuj
                </button>

                <button
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

<!-- MODAL: JOIN GROUP -->
{#if joinModalOpen}
  <div
    class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
  >
    <div
      class="bg-white w-full max-w-md rounded-2xl shadow border p-6 space-y-4"
    >
      <div class="flex items-start justify-between">
        <h3 class="text-xl font-semibold">Dołącz do grupy</h3>
        <button on:click={closeJoinModal}>✕</button>
      </div>

      <textarea
        bind:value={joinToken}
        rows="3"
        placeholder="Wklej token od trenera…"
        class="w-full border rounded-lg px-3 py-2"
      ></textarea>

      {#if joinError}<p class="text-red-600 text-sm">{joinError}</p>{/if}
      {#if joinSuccess}<p class="text-green-600 text-sm">{joinSuccess}</p>{/if}

      <div class="flex justify-end gap-2">
        <button class="px-4 py-2 bg-gray-200 rounded" on:click={closeJoinModal}>
          Anuluj
        </button>
        <button
          class="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
          disabled={joinLoading}
          on:click={joinGroupForChild}
        >
          {joinLoading ? "Dołączanie…" : "Dołącz"}
        </button>
      </div>
    </div>
  </div>
{/if}
