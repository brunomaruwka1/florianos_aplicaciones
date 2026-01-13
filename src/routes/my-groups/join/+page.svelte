<script>
  let token = '';
  let error = '';
  let success = '';
  let loading = false;

  async function joinGroup() {
    error = '';
    success = '';

    const cleanedToken = token.trim();
    if (!cleanedToken) {
      error = 'Wklej token od trenera';
      return;
    }

    loading = true;

    const res = await fetch('/api/students/invites/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: cleanedToken })
    });

    const data = await res.json();
    loading = false;

    if (!res.ok) {
      error = data.error || 'Błąd';
      return;
    }

    success = 'Dołączono do grupy ✅';
    token = '';

    setTimeout(() => {
      window.location.href = '/my-groups';
    }, 900);
  }

  function handleKeydown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      joinGroup();
    }
  }
</script>

<div class="max-w-md mx-auto mt-16 bg-white p-6 rounded-2xl shadow border border-gray-200 space-y-5">
  <div>
    <h1 class="text-2xl font-bold">Dołącz do grupy</h1>
    <p class="text-sm text-gray-500 mt-1">
      Wklej token otrzymany od trenera, aby dołączyć.
    </p>
  </div>

  <div class="space-y-2">
    <label class="text-sm font-medium text-gray-700">
      Token zaproszenia
    </label>

    <textarea
      bind:value={token}
      rows="3"
      placeholder="Wklej token tutaj…"
      class="w-full border px-3 py-2 rounded-lg resize-none outline-none focus:ring-2 focus:ring-blue-500"
      on:keydown={handleKeydown}
      disabled={loading}
    ></textarea>

    <p class="text-xs text-gray-400">
      Tip: <span class="font-semibold">Ctrl+Enter</span> wysyła formularz
    </p>
  </div>

  <button
    class="w-full px-4 py-2 rounded-lg font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed
           bg-blue-600 hover:bg-blue-700"
    disabled={loading || !token.trim()}
    on:click={joinGroup}
  >
    {loading ? 'Dołączanie…' : 'Dołącz'}
  </button>

  {#if error}
    <div class="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
      {error}
    </div>
  {/if}

  {#if success}
    <div class="p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm">
      {success}
    </div>
  {/if}
</div>
