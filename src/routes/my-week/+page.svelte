<script>
  import { goto } from "$app/navigation";

  export let data;

  const days = [
    "Poniedziałek",
    "Wtorek",
    "Środa",
    "Czwartek",
    "Piątek",
    "Sobota",
    "Niedziela",
  ];

  $: classes = data.classes || [];

  /* =========================
   * SAFE DATE HELPERS (NO UTC BUG)
   * ========================= */

  // ISO YYYY-MM-DD -> Date (LOCAL time)
  function dateFromISO(iso) {
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d, 12, 0, 0); // 12:00 => brak cofania dnia
  }

  // Date -> ISO YYYY-MM-DD (LOCAL time)
  function toISODateLocal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sunday
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    d.setHours(12, 0, 0, 0);
    return d;
  }

  $: weekStart = getMonday(dateFromISO(data.week) || new Date());

  function dateForDayIndex(dayIndex) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dayIndex);
    d.setHours(12, 0, 0, 0);
    return d;
  }

  /* =========================
   * NAVIGATION (prev / next week)
   * ========================= */

  function prevWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7); //

    const weekISO = toISODateLocal(getMonday(d));
    goto(`/my-week?week=${weekISO}`);
  }

  function nextWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7); //

    const weekISO = toISODateLocal(getMonday(d));
    goto(`/my-week?week=${weekISO}`);
  }

  /* =========================
   * Helpers
   * ========================= */

  function formatTime(t) {
    if (!t) return "";
    return String(t).slice(0, 5);
  }

  function getDayClasses(dayIndex) {
    return classes
      .filter((c) => Number(c.day_of_week) === dayIndex)
      .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));
  }

  /* =========================
   * Open session
   * ========================= */

  let loadingId = null;
  let error = "";

  async function openSession(cls) {
    error = "";
    loadingId = cls.id;

    const session_date = toISODateLocal(
      dateForDayIndex(Number(cls.day_of_week)),
    );

    const res = await fetch("/api/class-sessions/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_id: cls.id,
        session_date,
      }),
    });

    const out = await res.json();
    loadingId = null;

    if (!res.ok) {
      error = out.error || "Błąd tworzenia sesji";
      return;
    }

    const sessionId = out?.session?.id;

    if (!sessionId) {
      error = "Backend nie zwrócił session.id";
      console.log("OPEN SESSION RESPONSE:", out);
      return;
    }

    goto(`/my-week/session/${sessionId}`);
  }
</script>

<div class="max-w-7xl mx-auto px-4 py-10 space-y-8">
  <!-- HEADER -->
  <div class="flex items-start justify-between flex-wrap gap-4">
    <div>
      <h1 class="text-3xl font-bold">Mój tydzień</h1>
      <p class="text-gray-600 mt-1">
        Kliknij zajęcia aby rozpocząć / zakończyć i sprawdzić frekwencję.
      </p>
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <button
        class="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        on:click={prevWeek}
      >
        ← Poprzedni tydzień
      </button>

      <div class="text-sm text-gray-600 bg-white border rounded-lg px-3 py--2">
        {toISODateLocal(weekStart)} – {toISODateLocal(dateForDayIndex(6))}
      </div>

      <button
        class="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        on:click={nextWeek}
      >
        Następny tydzień →
      </button>
    </div>
  </div>

  {#if error}
    <p class="text-red-600 text-sm">{error}</p>
  {/if}

  <!-- key = wymusza refresh kafelków po zmianie tygodnia -->
  {#key data.week}
    <!-- LISTA DNI -->
    <div class="space-y-5">
      {#each days as day, dayIndex}
        <div class="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <!-- nagłówek dnia -->
          <div
            class="flex items-center justify-between gap-4 px-6 py-4 border-b bg-gray-50"
          >
            <div>
              <h2 class="text-lg font-semibold">{day}</h2>
              <p class="text-sm text-gray-500">
                {toISODateLocal(dateForDayIndex(dayIndex))}
              </p>
            </div>

            <div class="text-sm text-gray-400">
              {#if getDayClasses(dayIndex).length > 0}
                Zajęcia: {getDayClasses(dayIndex).length}
              {:else}
                Brak zajęć
              {/if}
            </div>
          </div>

          <!-- lista zajęć -->
          <div class="p-6">
            {#if getDayClasses(dayIndex).length === 0}
              <p class="text-sm text-gray-400">Brak zajęć w tym dniu.</p>
            {:else}
              <div class="space-y-3">
                {#each getDayClasses(dayIndex) as cls}
                  <button
                    class="w-full text-left border rounded-xl p-4 hover:bg-gray-50 transition flex items-center justify-between gap-4"
                    disabled={loadingId === cls.id}
                    on:click={() => openSession(cls)}
                  >
                    <div class="min-w-0">
                      <div class="font-semibold text-base truncate">
                        {cls.group?.name || "Grupa"}
                      </div>

                      <div class="text-sm text-gray-600 mt-1">
                        {formatTime(cls.start_time)} – {formatTime(
                          cls.end_time,
                        )}
                      </div>

                      {#if loadingId === cls.id}
                        <div class="text-xs text-blue-600 mt-2">
                          Otwieranie sesji…
                        </div>
                      {/if}
                    </div>

                    <div class="shrink-0">
                      <span
                        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"
                      >
                        Otwórz sesję →
                      </span>
                    </div>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/key}
</div>
