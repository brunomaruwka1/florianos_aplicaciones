<script>
  export let data;

  const role = data.role;
  const classes = data.classes || [];
  const error = data.error || '';

  const days = [
    "Poniedziałek",
    "Wtorek",
    "Środa",
    "Czwartek",
    "Piątek",
    "Sobota",
    "Niedziela"
  ];

  function formatTime(t) {
    if (!t) return '';
    return String(t).slice(0, 5);
  }
</script>

<div class="max-w-4xl mx-auto px-4 py-10 space-y-8">

  <div>
    <h1 class="text-3xl font-bold">Moje zajęcia</h1>
    <p class="text-gray-600 mt-1">
      Lista zajęć przypisanych do Twoich grup.
    </p>
  </div>

  {#if role !== 'student'}
    <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4">
      Ta strona jest dostępna tylko dla podopiecznych.
    </div>
  {:else}

    {#if error}
      <div class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
        {error}
      </div>
    {/if}

    {#if classes.length === 0}
      <div class="bg-white border rounded-2xl shadow-sm p-6">
        <p class="text-gray-500">Brak zajęć przypisanych do Twoich grup.</p>
      </div>
    {:else}
      <div class="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b bg-gray-50">
          <h2 class="text-lg font-semibold">Zajęcia</h2>
        </div>

        <div class="p-6 space-y-3">
          {#each classes as c}
            <div class="border rounded-xl p-4 flex items-center justify-between gap-4">
              <div class="min-w-0">
                <div class="font-semibold truncate">
                  {c.group_id?.name || 'Grupa'}
                </div>

                <div class="text-sm text-gray-600 mt-1">
                  {days[Number(c.day_of_week)]}
                  · {formatTime(c.start_time)} – {formatTime(c.end_time)}
                </div>
              </div>

              <span class="shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                zajęcia
              </span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}

</div>
