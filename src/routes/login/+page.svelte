<script>
  export let form;
</script>

<form method="POST">
  <input type="email" name="email" required />
  <input type="password" name="password" required />

  <button type="submit">Zaloguj się</button>

  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}
</form>
