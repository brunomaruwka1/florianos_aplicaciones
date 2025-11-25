<script>
  import { goto } from '$app/navigation';
</script>

<style>
  .container {
    max-width: 480px;
    margin: 60px auto;
    padding: 30px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 4px 25px rgba(0,0,0,0.08);
    text-align: center;
    font-family: sans-serif;
  }

  h2 {
    margin-bottom: 24px;
  }

  button {
    width: 100%;
    padding: 14px;
    margin-bottom: 12px;
    border: none;
    border-radius: 8px;
    background: #3b82f6;
    color: white;
    font-weight: bold;
    cursor: pointer;
    font-size: 15px;
  }

  button:hover {
    background: #2563eb;
  }

  .disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
</style>

<div class="container">
  <h2>Wybierz rodzaj konta</h2>

  <button on:click={() => goto('/register/student')} class="disabled">
    Student (w budowie)
  </button>

  <button on:click={() => goto('/register/parent')} class="disabled">
    Rodzic (w budowie)
  </button>

  <button on:click={() => goto('../register-trainer')}>
    Trener
  </button>
</div>
