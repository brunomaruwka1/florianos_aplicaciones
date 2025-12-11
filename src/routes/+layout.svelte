<script>
    export let data;
	    import "../app.css";

    import Navbar from "$lib/components/Navbar.svelte";
</script>

<Navbar session={data.session} />

<main class="max-w-6xl mx-auto px-4 py-6">
    <slot />
</main>
