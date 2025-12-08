<script>
    import { goto } from '$app/navigation';

    function goTrainer() {
        goto('/register-trainer');
    }

    function goParent() {
        goto('/register-parent');
    }

    function goStudent() {
        goto('/register-student');
    }
</script>

<div class="container">
    <h1>Wybierz typ rejestracji</h1>
    <p>Z kim zakładasz konto w systemie?</p>

    <div class="buttons">
        <button on:click={goTrainer} class="trainer">
            Rejestracja trenera
        </button>

        <button on:click={goParent} class="parent">
            Rejestracja rodzica
        </button>

        <button on:click={goStudent} class="student">
            Rejestracja podopiecznego 
        </button>
    </div>
</div>

<style>
    .container {
        max-width: 480px;
        margin: 60px auto;
        padding: 32px;
        border-radius: 12px;
        background: #ffffff;
        box-shadow: 0 4px 25px rgba(0,0,0,0.08);
        text-align: center;
        font-family: sans-serif;
    }

    h1 { 
        margin-bottom: 10px; 
        font-size: 24px; 
        font-weight: 600;
    }

    p { 
        margin-bottom: 25px; 
        color: #666; 
    }

    .buttons { 
        display: flex; 
        flex-direction: column; 
        gap: 15px; 
    }

    button {
        padding: 14px;
        font-size: 16px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: 0.2s;
        color: white;
    }

    .trainer { background: #3b82f6; }
    .trainer:hover { background: #2563eb; }

    .parent { background: #10b981; }
    .parent:hover { background: #059669; }

    .student { background: #f59e0b; }
    .student:hover { background: #d97706; }
</style>
