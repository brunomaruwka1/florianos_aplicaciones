<script>
	import Navbar from '$lib/components/Navbar.svelte';
	export let data;
</script>

<Navbar session={data.session} />

<slot />
