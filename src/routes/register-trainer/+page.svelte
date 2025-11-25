<script lang="ts">
  export let form;
</script>

<style>
  .container {
    max-width: 420px;
    margin: 50px auto;
    padding: 25px;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 4px 25px rgba(0,0,0,0.08);
    font-family: sans-serif;
  }

  h2 {
    text-align: center;
    margin-bottom: 20px;
  }

  input {
    width: 100%;
    padding: 10px 12px;
    margin-bottom: 12px;
    border-radius: 8px;
    border: 1px solid #ddd;
    font-size: 14px;
  }

  button {
    width: 100%;
    padding: 12px;
    background: #3b82f6;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s;
  }

  button:hover {
    background: #2563eb;
  }

  .error {
    margin-top: 10px;
    padding: 12px;
    background: #fee2e2;
    color: #b91c1c;
    border-radius: 8px;
    font-size: 14px;
  }
</style>

<div class="container">
  <h2>Rejestracja trenera</h2>

  <form method="POST">
    <input name="email" type="email" placeholder="Email" required />
    <input name="password" type="password" placeholder="Hasło" required />
    <input name="first_name" type="text" placeholder="Imię" required />
    <input name="last_name" type="text" placeholder="Nazwisko" required />
    <input name="birth_date" type="date" required />

    <button type="submit">Stwórz konto trenera</button>
  </form>

  {#if form?.error}
    <div class="error">{form.error}</div>
  {/if}
</div>
