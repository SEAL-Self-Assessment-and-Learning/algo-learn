<!-- Error page for errors occurring inside load() -->
<script lang="ts">
  import { goto } from "$app/navigation"
  import { base } from "$app/paths"
  import { page } from "$app/state"
  import { DEFAULT_LANGUAGE } from "$lib/translation.ts"

  function handleGoto() {
    // goes to start page, if possible
    goto(`${base}/${DEFAULT_LANGUAGE}`)
  }
</script>

<div class="error-page">
  <div class="error-container">
    <p class="error-message">An error occurred: {page.error?.message}</p>
    <button class="button" onclick={handleGoto}>Go to Start Page</button>
  </div>
</div>

<!-- Tailwind does not work in this file? -->
<style>
  .error-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    height: 85vh;
    color: oklch(0.396 0.141 25.723);
    text-align: center;
  }

  .error-container {
    border-radius: 10px;
    background-color: oklch(0.885 0.062 18.334);
    padding: 20px;
    max-width: 768px;
  }
  .error-message {
    margin-bottom: 40px;
    font-size: 1.5rem;
  }
  .button {
    cursor: pointer;
    border: none;
    border-radius: 5px;
    background-color: oklch(0.396 0.141 25.723);
    padding: 10px 20px;
    color: white;
    font-size: 1rem;
  }
  .button:hover {
    cursor: pointer;
    background-color: oklch(0.35 0.126 25.898);
  }
</style>
