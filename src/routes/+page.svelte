<script>
  import { goto } from '$app/navigation';
</script>

<style>
  .container {
    max-width: 900px;
    margin: 80px auto;
    text-align: center;
    font-family: sans-serif;
  }

  h1 {
    font-size: 36px;
    margin-bottom: 20px;
  }

  p {
    font-size: 18px;
    margin-bottom: 30px;
    color: #555;
  }

  

  button {
    margin-top: 20px;
    padding: 12px 26px;
    font-size: 16px;
    border: none;
    background: #3b82f6;
    color: white;
    border-radius: 8px;
    cursor: pointer;
  }

  button:hover {
    background: #2563eb;
  }
</style>


<div class="container">
  <h1>Witaj w aplikacji treningowej</h1>
  <p>Platforma do pracy trenerów, rodziców i młodych sportowców.</p>

  <button on:click={() => goto('/register')}>Rozpocznij teraz</button>
</div>
