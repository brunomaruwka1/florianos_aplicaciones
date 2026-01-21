<script>
  export let data;

  const student = data.student;
  const history = data.history || [];

  function formatDatePL(dateStr) {
    return new Date(dateStr).toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatTime(t) {
    if (!t) return '';
    return String(t).slice(0, 5);
  }

  /* --------------------------------------------------
   *  STATYSTYKI
   * -------------------------------------------------- */

  // obecność liczymy tylko gdy present !== null
  const attendanceRows = history.filter((h) => h.present !== null && h.present !== undefined);
  // ✅ frekwencja: mianownik = wszystkie sesje (history)
    const attendanceTotal = history.length;
    const attendancePresent = history.filter((h) => h.present === true).length;

    // brak present => liczy się jako nieobecność
    const attendancePercent =
    attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : null;


  // średnia ocena liczymy tylko gdy grade !== null
  const gradeRows = history.filter((h) => h.grade !== null && h.grade !== undefined);
  const gradeCount = gradeRows.length;
  const gradeAvg =
    gradeCount > 0
      ? Math.round((gradeRows.reduce((sum, h) => sum + Number(h.grade), 0) / gradeCount) * 10) / 10
      : null;
</script>

<div class="max-w-6xl mx-auto px-4 py-10 space-y-8">

  <!-- HEADER -->
  <div class="bg-white border rounded-2xl shadow-sm p-6">
    <h1 class="text-3xl font-bold">
      {student.first_name} {student.last_name}
    </h1>

    <div class="text-sm text-gray-600 mt-2 space-y-1">
      <div>🎂 Data urodzenia: {new Date(student.birth_date).toLocaleDateString()}</div>
      <div class="text-gray-400">ID: {student.id}</div>
    </div>
  </div>

  <!-- ✅ STATYSTYKI -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

    <!-- frekwencja -->
    <div class="bg-white border rounded-2xl shadow-sm p-5">
      <div class="text-sm text-gray-500 mb-1">Frekwencja</div>

      {#if attendancePercent === null}
        <div class="text-xl font-bold text-gray-400">Brak danych</div>
      {:else}
        <div class="text-3xl font-bold">
          {attendancePercent}%
        </div>
        <div class="text-sm text-gray-600 mt-1">
          Obecny: {attendancePresent} / {attendanceTotal}
        </div>
      {/if}
    </div>

    <!-- średnia ocena -->
    <div class="bg-white border rounded-2xl shadow-sm p-5">
      <div class="text-sm text-gray-500 mb-1">Średnia ocena</div>

      {#if gradeAvg === null}
        <div class="text-xl font-bold text-gray-400">Brak ocen</div>
      {:else}
        <div class="text-3xl font-bold">
          {gradeAvg}
        </div>
        <div class="text-sm text-gray-600 mt-1">
          Liczba ocen: {gradeCount}
        </div>
      {/if}
    </div>

    <!-- ilość sesji -->
    <div class="bg-white border rounded-2xl shadow-sm p-5">
      <div class="text-sm text-gray-500 mb-1">Wszystkie sesje</div>
      <div class="text-3xl font-bold">
        {history.length}
      </div>
      <div class="text-sm text-gray-600 mt-1">
        Zapisane w historii ucznia
      </div>
    </div>

  </div>

  <!-- HISTORIA -->
  <div class="bg-white border rounded-2xl shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b bg-gray-50">
      <h2 class="text-xl font-semibold">Historia treningów / sesji</h2>
      <p class="text-sm text-gray-500">
        Obecność + oceny z zajęć.
      </p>
    </div>

    <div class="p-6">
      {#if history.length === 0}
        <p class="text-gray-500">Brak zapisanych sesji dla tego ucznia.</p>
      {:else}
        <div class="space-y-3">
          {#each history as h}
            <div class="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div class="min-w-0">
                <div class="font-semibold truncate">
                  {h.session?.group?.name || 'Grupa'} · {formatDatePL(h.session?.session_date)}
                </div>

                <div class="text-sm text-gray-600 mt-1">
                  {formatTime(h.session?.start_time)} – {formatTime(h.session?.end_time)}
                </div>

                {#if h.note}
                  <div class="text-sm text-gray-500 mt-2">
                    📝 {h.note}
                  </div>
                {/if}
              </div>

              <div class="shrink-0 flex items-center gap-3">
                {#if h.present === true}
                  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    ✅ obecny
                  </span>
                {:else if h.present === false}
                  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    ❌ nieobecny
                  </span>
                {:else}
                  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    ❌ nieobecny
                  </span>
                {/if}


                {#if h.grade !== null && h.grade !== undefined}
                  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    🎯 ocena: {h.grade}
                  </span>
                {:else}
                  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    brak oceny
                  </span>
                {/if}
              </div>

            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

</div>
