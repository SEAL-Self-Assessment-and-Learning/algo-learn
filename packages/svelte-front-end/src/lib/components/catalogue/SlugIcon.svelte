<script lang="ts">
  interface Props {
    slug: string
  }
  let { slug }: Props = $props()
</script>

<div
  class="bg-goethe flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-300 group-hover:scale-110"
>
  {#if slug === "demos"}
    <svg
      viewBox="0 0 76 76"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      fill="currentColor"
      xml:space="preserve"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M37.208 49.083a3.958 3.958 0 1 1 0 7.917 3.958 3.958 0 0 1 0-7.917M38 17.417c6.996 0 12.667 4.525 12.667 11.083 0 2.375-1.584 6.333-4.75 7.917s-4.75 3.71-4.75 6.333v3.167H33.25v-2.375c0-5.385 4.75-8.709 6.333-10.292 3.167-3.167 3.167-3.606 3.167-4.75a4.75 4.75 0 0 0-9.5 0v2.375h-7.917v-1.583c0-6.559 5.671-11.875 12.667-11.875"
      />
    </svg>
  {:else}
    <!-- Placeholder SVG -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      class="h-7 w-7"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 6v6h4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  {/if}
</div>
