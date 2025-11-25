<script>
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let errorMsg = '';

  async function login() {
    errorMsg = '';

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      errorMsg = "Niepoprawny email lub hasło.";
      return;
    }

    goto('/dashboard');
  }
</script>

<style>
  .container {
    max-width: 420px;
    margin: 60px auto;
    padding: 32px;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 4px 25px rgba(0,0,0,0.08);
    font-family: sans-serif;
  }

  h2 {
    text-align: center;
    margin-bottom: 24px;
    font-weight: 600;
  }

  input {
    width: 100%;
    padding: 12px;
    margin-bottom: 14px;
    border-radius: 8px;
    border: 1px solid #ddd;
    font-size: 15px;
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
    margin-top: 10px;
    transition: 0.2s;
  }

  button:hover {
    background: #2563eb;
  }

  .error {
    margin-top: 15px;
    padding: 12px;
    background: #fee2e2;
    color: #b91c1c;
    border-radius: 8px;
    font-size: 14px;
    text-align: center;
  }

  .register_sign {
    text-decoration: none;
    color: black;
  }

  .register_sign:hover {
    text-decoration: none;
    color: rgb(74, 71, 71);
  }
</style>

<div class="container">
  <h2>Logowanie</h2>

  <form on:submit|preventDefault={login}>
    <input
      type="email"
      bind:value={email}
      placeholder="Email"
      required
    />

    <input
      type="password"
      bind:value={password}
      placeholder="Hasło"
      required
    />

    <a href="../register" class="register_sign"> Nie masz konta? Zarejestruj się</a>

    <button type="submit">Zaloguj się</button>
  </form>

  {#if errorMsg}
    <div class="error">{errorMsg}</div>
  {/if}
</div>
