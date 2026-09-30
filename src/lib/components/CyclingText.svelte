<script>
  // Rotating tagline. Animation is pure css (.c-active / .c-exit in app.css).
  let { items, interval = 3200 } = $props();

  let current = $state(0);
  let previous = $state(-1);

  $effect(() => {
    const id = setInterval(() => {
      previous = current;
      current = (current + 1) % items.length;
    }, interval);
    return () => clearInterval(id);
  });
</script>

<div class="cycling-text-wrapper">
  {#each items as text, i}
    <p class="display-4 kewl-gradient-text cycling-text" class:c-active={i === current} class:c-exit={i === previous}>
      {text}
    </p>
  {/each}
</div>
