<script>
  import { goto } from '$app/navigation';
  export let data;

  const role = data.role;
  let todayClasses = data.todayClasses || [];

  let loadingId = null;
  let todayError = '';

  function formatTime(t) {
    if (!t) return '';
    return String(t).slice(0, 5);
  }

  function formatDatePL(date) {
    return new Date(date).toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  async function openSession(cls) {
    todayError = '';
    loadingId = cls.id;

    const session_date = new Date().toISOString().slice(0, 10);

    const res = await fetch('/api/class-sessions/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        class_id: cls.id,
        session_date
      })
    });

    const out = await res.json();
    loadingId = null;

    if (!res.ok) {
      todayError = out.error || 'Błąd otwierania sesji';
      return;
    }

    goto(`/my-week/session/${out.session.id}`);
  }

  // ===== KAFELKI TRENERA =====
  const trainerCards = [
    {
      title: "Moje grupy",
      desc: "Zarządzaj swoimi grupami.",
      icon: "👥",
      link: "/groups"
    },
    {
      title: "Moi podopieczni",
      desc: "Przeglądaj i dodawaj podopiecznych.",
      icon: "🧒",
      link: "/students"
    },
    {
      title: "Mój tydzień",
      desc: "Zarządzaj zajęciami w tym tygodniu (frekwencja, oceny).",
      icon: "🗓️",
      link: "/my-week"
    },
    {
      title: "Moje zajęcia",
      desc: "Harmonogram i edycja zajęć.",
      icon: "📅",
      link: "/classes"
    },{
      title: "Wiadomości",
      desc: "Rozmowy z podopiecznymi i rodzicami.",
      icon: "💬",
      link: "/messages"
    },

  ];

  // ===== KAFELKI RODZICA =====
  const parentCards = [
    {
      title: "Moje dzieci",
      desc: "Lista Twoich dzieci.",
      icon: "👨‍👧‍👦",
      link: "/parent/children"
    },
    {
      title: "Moje zajęcia",
      desc: "Zobacz swoje zajęcia.",
      icon: "📘",
      link: "/classes/my"
    },
    {
      title: "Zajęcia moich dzieci",
      desc: "Harmonogram zajęć dzieci.",
      icon: "🏫",
      link: "/classes/children"
    },{
      title: "Wiadomości",
      desc: "Rozmowy z podopiecznymi i rodzicami.",
      icon: "💬",
      link: "/messages"
    },
  ];

  // ===== KAFELKI STUDENTA =====
  const studentCards = [
    {
      title: "Moje zajęcia",
      desc: "Harmonogram zajęć.",
      icon: "📅",
      link: "/classes"
    },
    {
      title: "Moja grupa",
      desc: "Zobacz swoją grupę.",
      icon: "👤",
      link: "/my-groups"
    },{
      title: "Wiadomości",
      desc: "Rozmowy z podopiecznymi i rodzicami.",
      icon: "💬",
      link: "/messages"
    },  
  ];
</script>

<div class="max-w-6xl mx-auto px-4 py-10">

  <h1 class="text-3xl font-bold mb-2">Mój profil</h1>
  <p class="text-gray-600 mb-8">
    Wybierz jedną z dostępnych opcji.
  </p>

  <!-- ✅ DZISIAJ (TYLKO TRENER) -->
  {#if role === 'trainer'}
    <div class="mb-10 bg-white border rounded-2xl shadow-sm p-6">
      <div class="flex items-center justify-between gap-4 flex-wrap mb-4">
        <div>
          <h2 class="text-xl font-bold">Dzisiejsze zajęcia</h2>
          <p class="text-sm text-gray-500">
            {formatDatePL(new Date())}
          </p>
        </div>

        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          on:click={() => goto('/my-week')}
        >
          Zobacz tydzień →
        </button>
      </div>

      {#if todayError}
        <p class="text-red-600 text-sm mb-3">{todayError}</p>
      {/if}

      {#if todayClasses.length === 0}
        <p class="text-sm text-gray-500">Brak zajęć na dziś ✅</p>
      {:else}
        <div class="space-y-3">
          {#each todayClasses as cls}
            <button
              class="w-full text-left border rounded-xl px-4 py-3 hover:bg-gray-50 transition flex items-center justify-between gap-4"
              disabled={loadingId === cls.id}
              on:click={() => openSession(cls)}
            >
              <div class="min-w-0">
                <div class="font-semibold truncate">
                  {cls.group?.name || 'Grupa'}
                </div>
                <div class="text-sm text-gray-600 mt-1">
                  {formatTime(cls.start_time)} – {formatTime(cls.end_time)}
                </div>

                {#if loadingId === cls.id}
                  <div class="text-xs text-blue-600 mt-1">
                    Otwieranie sesji…
                  </div>
                {/if}
              </div>

              <span class="shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                Sesja →
              </span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- GRID KAFELKÓW -->
  <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">

    {#if role === 'trainer'}
      {#each trainerCards as c}
        <div
          on:click={() => goto(c.link)}
          class="p-6 bg-white border rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer transition"
        >
          <div class="text-5xl mb-3">{c.icon}</div>
          <h2 class="text-xl font-semibold">{c.title}</h2>
          <p class="text-gray-600 mt-1">{c.desc}</p>
        </div>
      {/each}

    {:else if role === 'parent'}
      {#each parentCards as c}
        <div
          on:click={() => goto(c.link)}
          class={`p-6 rounded-2xl shadow-sm cursor-pointer transition
            ${c.highlight
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-white border hover:shadow-lg hover:-translate-y-1'
            }`}
        >
          <div class="text-5xl mb-3">{c.icon}</div>
          <h2 class="text-xl font-semibold">{c.title}</h2>
          <p class={`${c.highlight ? 'text-green-100' : 'text-gray-600'} mt-1`}>
            {c.desc}
          </p>
        </div>
      {/each}

    {:else if role === 'student'}
      {#each studentCards as c}
        <div
          on:click={() => goto(c.link)}
          class="p-6 bg-white border rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer transition"
        >
          <div class="text-5xl mb-3">{c.icon}</div>
          <h2 class="text-xl font-semibold">{c.title}</h2>
          <p class="text-gray-600 mt-1">{c.desc}</p>
        </div>
      {/each}

    {:else}
      <p>Nieznana rola użytkownika.</p>
    {/if}

  </div>

</div>
