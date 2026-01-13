<script>
  import { onMount } from 'svelte';

  let classes = [];
  let groups = [];

  // ➕ dodawanie
  let group_id = '';
  let day_of_week = 0;
  let start_time = '';
  let end_time = '';

  // ✏️ edycja
  let editingId = null;
  let edit_group_id = '';
  let edit_day_of_week = 0;
  let edit_start_time = '';
  let edit_end_time = '';

  const days = [
    "Poniedziałek",
    "Wtorek",
    "Środa",
    "Czwartek",
    "Piątek",
    "Sobota",
    "Niedziela"
  ];

  // grid
  const START_HOUR = 7;
  const END_HOUR = 21;
  const HOUR_HEIGHT = 52;

  /* --------------------------------------------------
   * NORMALIZACJE
   * -------------------------------------------------- */

  function normalizeTime(t) {
    if (!t) return null;
    return String(t).slice(0, 5);
  }

  function formatTime(t) {
    const nt = normalizeTime(t);
    return nt || '—';
  }

  function normalizeDay(d) {
    const n = Number(d);
    return Number.isFinite(n) ? n : null;
  }

  function timeToMinutes(t) {
    const nt = normalizeTime(t);
    if (!nt) return null;

    const [h, m] = nt.split(':').map(Number);
    return h * 60 + m;
  }

  function minutesToTop(mins) {
    return ((mins - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  }

  function durationToHeight(start, end) {
    const s = timeToMinutes(start);
    const e = timeToMinutes(end);

    if (s === null || e === null) return HOUR_HEIGHT;
    return ((e - s) / 60) * HOUR_HEIGHT;
  }

  function addMinutes(time, minutes) {
    const nt = normalizeTime(time);
    if (!nt) return null;

    const total = timeToMinutes(nt) + minutes;
    const h = Math.floor(total / 60).toString().padStart(2, '0');
    const m = (total % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  function safeEnd(c) {
    const start = normalizeTime(c.start_time);
    const end = normalizeTime(c.end_time);
    if (!start) return null;

    return end || addMinutes(start, 60);
  }

  function classTimeRange(c) {
    const s = normalizeTime(c.start_time);
    if (!s) return '—';

    const e = normalizeTime(c.end_time) || addMinutes(s, 60);
    return `${s} – ${e}`;
  }

  function getDayClasses(dayIndex) {
    return classes
      .filter((c) => normalizeDay(c.day_of_week) === dayIndex)
      .map((c) => ({
        ...c,
        day_of_week: normalizeDay(c.day_of_week),
        start_time: normalizeTime(c.start_time),
        end_time: normalizeTime(c.end_time)
      }));
  }

  function sortClassesForList(arr) {
    return [...arr].sort((a, b) => {
      const da = Number(a.day_of_week);
      const db = Number(b.day_of_week);
      if (da !== db) return da - db;

      const sa = timeToMinutes(a.start_time) ?? 0;
      const sb = timeToMinutes(b.start_time) ?? 0;
      return sa - sb;
    });
  }

  /* --------------------------------------------------
   * LOAD
   * -------------------------------------------------- */

  onMount(async () => {
    const g = await (await fetch('/api/groups')).json();
    groups = Array.isArray(g) ? g : [];

    const c = await (await fetch('/api/classes')).json();
    classes = Array.isArray(c) ? c : [];
  });

  async function reload() {
    const c = await (await fetch('/api/classes')).json();
    classes = Array.isArray(c) ? c : [];
  }

  /* --------------------------------------------------
   * CRUD
   * -------------------------------------------------- */

  async function addClass() {
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group_id,
        day_of_week: Number(day_of_week),
        start_time,
        end_time
      })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || 'Błąd');

    group_id = '';
    day_of_week = 0;
    start_time = '';
    end_time = '';

    await reload();
  }

  function startEdit(c) {
    editingId = c.id;
    edit_group_id = c.group_id?.id || c.group_id;
    edit_day_of_week = Number(c.day_of_week);
    edit_start_time = normalizeTime(c.start_time) || '';
    edit_end_time = normalizeTime(c.end_time) || '';
  }

  function cancelEdit() {
    editingId = null;
    edit_group_id = '';
    edit_day_of_week = 0;
    edit_start_time = '';
    edit_end_time = '';
  }

  async function updateClass() {
    const res = await fetch('/api/classes', {
      method: 'PATCH',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId,
        group_id: edit_group_id,
        day_of_week: Number(edit_day_of_week),
        start_time: edit_start_time,
        end_time: edit_end_time
      })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || 'Błąd');

    cancelEdit();
    await reload();
  }

  async function deleteClass(id) {
    if (!confirm("Usunąć zajęcia?")) return;

    const res = await fetch('/api/classes', {
      method: 'DELETE',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || 'Błąd');

    await reload();
  }
</script>

<div class="max-w-7xl mx-auto px-4 py-10 space-y-8">

  <!-- HEADER -->
  <div>
    <h1 class="text-3xl font-bold">Zajęcia</h1>
    <p class="text-gray-600 mt-1">
      Plan tygodniowy + lista.
    </p>
  </div>

  <!-- ADD FORM -->
  <div class="bg-white p-6 rounded-2xl shadow border border-gray-200">
    <h2 class="text-xl font-semibold mb-4">Dodaj zajęcia</h2>

    <form on:submit|preventDefault={addClass} class="grid grid-cols-1 md:grid-cols-5 gap-4">

      <select bind:value={group_id} required class="px-4 py-2 border rounded-lg">
        <option value="" disabled selected>Wybierz grupę</option>
        {#each groups as g}
          <option value={g.id}>{g.name}</option>
        {/each}
      </select>

      <select bind:value={day_of_week} required class="px-4 py-2 border rounded-lg">
        {#each days as d, i}
          <option value={i}>{d}</option>
        {/each}
      </select>

      <input type="time" bind:value={start_time} required class="px-4 py-2 border rounded-lg" />
      <input type="time" bind:value={end_time} class="px-4 py-2 border rounded-lg" />

      <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        Dodaj
      </button>
    </form>
  </div>

  <!-- EDIT MODAL -->
  {#if editingId}
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div class="bg-white w-full max-w-lg rounded-2xl shadow border p-6 space-y-4">
        <h3 class="text-xl font-semibold">Edytuj zajęcia</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select bind:value={edit_group_id} class="px-4 py-2 border rounded-lg">
            {#each groups as g}
              <option value={g.id}>{g.name}</option>
            {/each}
          </select>

          <select bind:value={edit_day_of_week} class="px-4 py-2 border rounded-lg">
            {#each days as d, i}
              <option value={i}>{d}</option>
            {/each}
          </select>

          <input type="time" bind:value={edit_start_time} class="px-4 py-2 border rounded-lg" />
          <input type="time" bind:value={edit_end_time} class="px-4 py-2 border rounded-lg" />
        </div>

        <div class="flex gap-2 justify-end">
          <button class="px-4 py-2 bg-gray-200 rounded-lg" type="button" on:click={cancelEdit}>
            Anuluj
          </button>
          <button class="px-4 py-2 bg-green-600 text-white rounded-lg" type="button" on:click={updateClass}>
            Zapisz
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- WEEK GRID -->
  <div class="bg-white p-6 rounded-2xl shadow border border-gray-200">
    <h2 class="text-xl font-semibold mb-6">Plan tygodniowy</h2>

    <div class="overflow-x-auto">
      <div class="min-w-[1100px]">

        <!-- header dni -->
        <div class="grid grid-cols-8 border-b">
          <div class="p-2 text-xs text-gray-500">Godzina</div>
          {#each days as d}
            <div class="p-2 font-semibold text-sm">{d}</div>
          {/each}
        </div>

        <!-- grid -->
        <div class="grid grid-cols-8">

          <!-- kolumna godzin -->
          <div class="border-r">
            {#each Array(END_HOUR - START_HOUR + 1) as _, i}
              <div
                class="border-b px-2 text-[11px] text-gray-500 flex items-start pt-1"
                style="height:{HOUR_HEIGHT}px"
              >
                {String(START_HOUR + i).padStart(2, '0')}:00
              </div>
            {/each}
          </div>

          <!-- kolumny dni -->
          {#each days as d, dayIndex}
            <div
              class="relative border-r"
              style="height:{(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT}px"
            >
              <!-- linie godzin -->
              {#each Array(END_HOUR - START_HOUR + 1) as _, i}
                <div class="border-b" style="height:{HOUR_HEIGHT}px"></div>
              {/each}

              <!-- ✅ MNIEJSZE KAFELKI -->
              {#each getDayClasses(dayIndex) as c}
                {#if c.start_time}
                  <div
                    class="absolute left-1 right-1 rounded-lg border shadow-sm bg-blue-50 border-blue-200 px-1.5 py-1 text-[11px]"
                    style="
                      top: {minutesToTop(timeToMinutes(c.start_time))}px;
                      height: {durationToHeight(c.start_time, safeEnd(c))}px;
                    "
                  >
                    <div class="font-semibold text-blue-900 truncate leading-tight">
                      {c.group_id?.name || 'Grupa'}
                    </div>

                    <div class="text-[10px] text-gray-600 leading-tight">
                      {c.start_time} – {safeEnd(c)}
                    </div>

                    <div class="flex gap-2 mt-1 text-[10px]">
                      <button
                        class="text-blue-700 hover:underline"
                        type="button"
                        on:click={() => startEdit(c)}
                      >
                        Edytuj
                      </button>

                      <button
                        class="text-red-600 hover:underline"
                        type="button"
                        on:click={() => deleteClass(c.id)}
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                {/if}
              {/each}

            </div>
          {/each}
        </div>

      </div>
    </div>
  </div>

  <!-- LISTA (fallback) -->
  <div class="bg-white p-6 rounded-2xl shadow border border-gray-200">
    <h2 class="text-xl font-semibold mb-4">Lista zajęć</h2>

    {#if classes.length === 0}
      <p class="text-gray-600">Brak zajęć.</p>
    {:else}
      <ul class="space-y-3">
        {#each sortClassesForList(classes) as c}
          <li class="p-4 border rounded-xl flex items-center justify-between gap-4">
            <div class="min-w-0">
              <div class="font-semibold">
                {c.group_id?.name || 'Grupa'} — {days[Number(c.day_of_week)]}
              </div>

              <div class="text-sm text-gray-600">
                {classTimeRange(c)}
              </div>
            </div>

            <div class="flex gap-3 shrink-0">
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
                on:click={() => deleteClass(c.id)}
              >
                Usuń
              </button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

</div>
