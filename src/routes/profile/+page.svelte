<script>
    import { goto } from '$app/navigation';
    export let data;

    const role = data.role;

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
            title: "Moje zajęcia",
            desc: "Harmonogram i edycja zajęć.",
            icon: "📅",
            link: "/classes"
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
        },
    ];
</script>

<div class="max-w-6xl mx-auto px-4 py-10">

    <h1 class="text-3xl font-bold mb-2">Mój profil</h1>
    <p class="text-gray-600 mb-8">
        Wybierz jedną z dostępnych opcji.
    </p>

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
