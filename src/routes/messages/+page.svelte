<script>
  import { onMount, tick } from 'svelte';

  let contacts = [];
  let active = null;
  let loading = true;
  let error = '';

  // conversation
  let conversationId = null;
  let messages = [];
  let messagesLoading = false;

  // send
  let text = '';
  let sending = false;

  let messagesBox;

  async function fetchContacts() {
    const res = await fetch('/api/messages/contacts');
    const data = await res.json();

    if (!res.ok) {
      error = data.error || 'Błąd';
    } else {
      contacts = data.contacts || [];
    }

    loading = false;
  }

  async function openConversation(contact) {
    active = contact;
    messages = [];
    conversationId = null;

    // 1) get/create conversation
    const res = await fetch('/api/messages/conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ other_profile_id: contact.profile_id })
    });

    const out = await res.json();
    if (!res.ok) {
      error = out.error || 'Błąd tworzenia konwersacji';
      return;
    }

    conversationId = out?.conversation?.id;
    await loadMessages();
  }

  async function loadMessages() {
    if (!conversationId) return;
    messagesLoading = true;

    const res = await fetch(`/api/messages/conversation/${conversationId}`);
    const out = await res.json();
    messagesLoading = false;

    if (!res.ok) {
      error = out.error || 'Błąd pobierania wiadomości';
      return;
    }

    messages = out.messages || [];

    await tick();
    if (messagesBox) messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  async function sendMessage() {
    error = '';
    const body = text.trim();
    if (!body || !conversationId) return;

    sending = true;

    const res = await fetch(`/api/messages/conversation/${conversationId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body })
    });

    const out = await res.json();
    sending = false;

    if (!res.ok) {
      error = out.error || 'Błąd wysyłania';
      return;
    }

    text = '';
    messages = [...messages, out.message];

    await tick();
    if (messagesBox) messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function onKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  onMount(fetchContacts);
</script>

<div class="max-w-7xl mx-auto h-[80vh] mt-10 bg-white border rounded-2xl shadow flex overflow-hidden">

  <!-- ===== LEWA KOLUMNA ===== -->
  <div class="w-80 border-r bg-gray-50 flex flex-col">
    <div class="p-4 font-bold border-b">
      Wiadomości
    </div>

    {#if loading}
      <p class="p-4 text-sm text-gray-500">Ładowanie…</p>
    {:else if contacts.length === 0}
      <p class="p-4 text-sm text-gray-500">Brak kontaktów</p>
    {:else}
      <ul class="flex-1 overflow-y-auto">
        {#each contacts as c}
          <li
            class="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b
              {active?.profile_id === c.profile_id ? 'bg-gray-200' : ''}"
            on:click={() => openConversation(c)}
          >
            <div class="font-semibold text-sm">
              {c.label}
            </div>
            <div class="text-xs text-gray-500">
              {c.type === 'student' ? 'Uczeń' : 'Rodzic'}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <!-- ===== PRAWA KOLUMNA ===== -->
  <div class="flex-1 flex flex-col">

    {#if !active}
      <div class="flex-1 flex items-center justify-center text-gray-400">
        Wybierz rozmowę
      </div>

    {:else}
      <!-- header -->
      <div class="p-4 border-b font-semibold">
        {active.label}
      </div>

      <!-- messages -->
      <div class="flex-1 p-4 overflow-y-auto" bind:this={messagesBox}>
        {#if messagesLoading}
          <p class="text-sm text-gray-400">Ładowanie wiadomości…</p>
        {:else if messages.length === 0}
          <p class="text-sm text-gray-400">Brak wiadomości — napisz pierwszą ✅</p>
        {:else}
          <div class="space-y-2">
            {#each messages as m}
              <div class="border rounded-xl px-4 py-2 text-sm">
                <div class="text-xs text-gray-500 mb-1">
                  {new Date(m.created_at).toLocaleString()}
                </div>
                <div>{m.body}</div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- input -->
      <div class="p-4 border-t space-y-2">
        <textarea
          rows="2"
          placeholder="Napisz wiadomość…"
          class="w-full px-4 py-2 border rounded-lg resize-none"
          bind:value={text}
          on:keydown={onKeydown}
        ></textarea>

        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          disabled={sending || !text.trim()}
          on:click={sendMessage}
        >
          {sending ? 'Wysyłanie…' : 'Wyślij'}
        </button>

        {#if error}
          <p class="text-red-600 text-sm">{error}</p>
        {/if}
      </div>
    {/if}

  </div>
</div>
