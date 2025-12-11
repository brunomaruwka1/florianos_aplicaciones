<script>
    import { goto } from '$app/navigation';

    const goTrainer = () => goto('/register-trainer');
    const goParent = () => goto('/register-parent');
    const goStudent = () => goto('/register-student');
</script>

<div class="max-w-md mx-auto mt-20 bg-white/80 backdrop-blur shadow-lg border border-gray-200 rounded-2xl p-8 text-center">

    <h1 class="text-2xl font-bold mb-2 p-5">Wybierz typ rejestracji</h1>

    <div class="flex flex-col gap-4">

        <button
            on:click={goTrainer}
            class="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition"
        >
            Rejestracja trenera
        </button>

        <button
            on:click={goParent}
            class="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow transition"
        >
            Rejestracja rodzica
        </button>

        <button
            on:click={goStudent}
            class="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow transition"
        >
            Rejestracja podopiecznego
        </button>

    </div>

</div>
