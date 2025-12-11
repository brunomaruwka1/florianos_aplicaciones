<script>
    import { goto } from '$app/navigation';
    export let data;

    const role = data.role;

    // definicja kafelków wg roli
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

    const parentCards = [
        {
            title: "Moje dzieci",
            desc: "Zarządzaj kontami swoich dzieci.",
            icon: "👨‍👧‍👦",
            link: "/parents/children"
        },
        {
            title: "Moje zajęcia",
            desc: "Zobacz swoje zajęcia.",
            icon: "📘",
            link: "/classes/my"
        },
        {
            title: "Zajęcia moich dzieci",
            desc: "Przeglądaj zajęcia swoich dzieci.",
            icon: "🏫",
            link: "/classes/children"
        },
    ];

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
            link: "/groups/my"
        },
    ];
</script>

<div class="max-w-6xl mx-auto px-4 py-10">

    <h1 class="text-3xl font-bold mb-6">Mój profil</h1>

    <p class="text-gray-600 mb-6">
        Wybierz jedną z dostępnych opcji.
    </p>

    <!-- GRID -->
    <div class="grid gap-6 grid-cols-1 md:grid-cols-3">

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
                    class="p-6 bg-white border rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer transition"
                >
                    <div class="text-5xl mb-3">{c.icon}</div>
                    <h2 class="text-xl font-semibold">{c.title}</h2>
                    <p class="text-gray-600 mt-1">{c.desc}</p>
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
