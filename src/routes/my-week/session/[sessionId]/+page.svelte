<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  export let data;

  const sessionId = data.sessionId;

  let loading = true;
  let saving = false;
  let finishing = false;

  let error = '';
  let success = '';

  let session = null;
  let students = [];

  function formatTime(t) {
    if (!t) return '';
    return String(t).slice(0, 5);
  }

  function formatDatePL(dateStr) {
    return new Date(dateStr).toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function presentCount() {
    return students.filter((s) => !!s.present).length;
  }

  async function loadSession() {
    loading = true;
    error = '';
    success = '';

    const res = await fetch(`/api/class-sessions/${sessionId}`);
    const out = await res.json();

    loading = false;

    if (!res.ok) {
      error = out.error || 'Błąd pobierania sesji';
      return;
    }

    session = out.session;
    students = out.students || [];
  }

  function togglePresent(studentId) {
    students = students.map((s) =>
      s.student_id === studentId
        ? { ...s, present: !s.present }
        : s
    );
  }

  async function saveAll() {
    saving = true;
    error = '';
    success = '';

    const res = await fetch(`/api/class-sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        students: students.map((s) => ({
          student_id: s.student_id,
          present: !!s.present,
          grade: s.grade ?? null,
          note: s.note ?? null
        }))
      })
    });

    const out = await res.json();
    saving = false;

    if (!res.ok) {
      error = out.error || 'Błąd zapisu';
      return;
    }

    success = 'Zapisano ✅';
    await loadSession();
  }

  async function finishSession() {
    if (!confirm('Na pewno zakończyć te zajęcia?')) return;

    finishing = true;
    error = '';
    success = '';

    const res = await fetch(`/api/class-sessions/${sessionId}/finish`, {
      method: 'POST'
    });

    const out = await res.json();
    finishing = false;

    if (!res.ok) {
      error = out.error || 'Nie udało się zakończyć zajęć';
      return;
    }

    success = 'Zajęcia zakończone ✅';

    setTimeout(() => {
      goto('/my-week');
    }, 700);
  }

  onMount(loadSession);
</script>

<div class="max-w-6xl mx-auto px-4 py-10 space-y-8">

  <!-- HEADER -->
  <div class="flex items-start justify-between gap-4 flex-wrap">
    <div>
      <h1 class="text-3xl font-bold">Sesja zajęć</h1>

      {#if session}
        <p class="text-gray-600 mt-2">
          <span class="font-semibold">{session.group?.name || 'Grupa'}</span>
          · {formatDatePL(session.session_date)}
          · {formatTime(session.start_time)} – {formatTime(session.end_time)}
        </p>

        <p class="text-sm text-gray-500 mt-1">
          Status: <span class="font-semibold">{session.status}</span>
        </p>
      {/if}
    </div>

    <div class="flex gap-2 flex-wrap">
      <button
        class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        on:click={() => goto('/my-week')}
      >
        ← Wróć
      </button>

      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        disabled={loading || saving || finishing || session?.status === 'finished'}
        on:click={saveAll}
      >
        {saving ? 'Zapisywanie…' : 'Zapisz'}
      </button>

      <button
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        disabled={loading || saving || finishing || session?.status === 'finished'}
        on:click={finishSession}
      >
        {finishing ? 'Zakańczanie…' : 'Zakończ zajęcia'}
      </button>
    </div>
  </div>

  <!-- INFO -->
  {#if session && students.length > 0}
    <div class="bg-white border rounded-2xl shadow-sm p-4 flex items-center justify-between flex-wrap gap-3">
      <div class="text-sm text-gray-700">
        Frekwencja:
        <span class="font-semibold">{presentCount()} / {students.length}</span>
      </div>

      {#if success}
        <div class="text-sm text-green-600 font-semibold">{success}</div>
      {/if}
    </div>
  {/if}

  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm">
      {error}
    </div>
  {/if}

  <!-- BODY -->
  <div class="bg-white border rounded-2xl shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b bg-gray-50">
      <h2 class="text-xl font-semibold">Frekwencja + oceny</h2>
    </div>

    <div class="p-6">
      {#if loading}
        <p class="text-gray-500">Ładowanie…</p>

      {:else if !session}
        <p class="text-gray-500">Brak danych sesji.</p>

      {:else if students.length === 0}
        <p class="text-gray-500">Brak uczniów w tej sesji.</p>

      {:else}
        <div class="space-y-3">
          {#each students as s}
            <div class="border rounded-xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              <div class="flex items-center gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={!!s.present}
                  disabled={session?.status === 'finished'}
                  on:change={() => togglePresent(s.student_id)}
                  class="w-5 h-5"
                />

                <div class="min-w-0">
                  <div class="font-semibold truncate">
                    {s.first_name} {s.last_name}
                  </div>

                  <div class="text-xs text-gray-500">
                    {#if s.present}
                      ✅ obecny
                    {:else}
                      ❌ nieobecny
                    {/if}
                  </div>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-2 sm:items-center w-full md:w-auto">
                <input
                  placeholder="Ocena"
                  class="px-3 py-2 border rounded-lg w-full sm:w-44 disabled:bg-gray-50"
                  disabled={session?.status === 'finished'}
                  bind:value={s.grade}
                />

                <input
                  placeholder="Notatka"
                  class="px-3 py-2 border rounded-lg w-full sm:w-72 disabled:bg-gray-50"
                  disabled={session?.status === 'finished'}
                  bind:value={s.note}
                />
              </div>

            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
