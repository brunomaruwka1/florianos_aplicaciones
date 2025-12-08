<script>
	import { goto } from '$app/navigation';

	export let session;

	async function logout() {
		// wołamy backend, który czyści cookies
		await fetch('/api/logout', {
			method: 'POST'
		});

		// przekierowanie na login (opcjonalnie można dać location.reload())
		goto('/login');
	}
</script>

<nav class="navbar bg-base-100 shadow-md mb-4">
	<div class="flex-1">
		<button class="btn btn-ghost text-xl" on:click={() => goto('/')}>
			Moja Apka
		</button>
	</div>

	<div class="flex-none">
		{#if session?.user}
			<button class="btn btn-outline btn-sm" on:click={logout}>
				Wyloguj się
			</button>
		{:else}
			<button class="btn btn-primary btn-sm" on:click={() => goto('/login')}>
				Zaloguj się
			</button>
		{/if}
	</div>
</nav>
