<script>
  import { onDestroy } from 'svelte';

  // the pane starts closed
  let open = false;

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  function onKeydown(e) {
    if (open && e.key === 'Escape') close();
  }

  // stop the page behind the pane from scrolling while it's open
  $: if (typeof document !== 'undefined') {
    document.body.style.overflow = open ? 'hidden' : '';
  }

  onDestroy(() => {
    document.body.style.overflow = '';
  });
</script>

<svelte:window onkeydown={onKeydown} />

<!-- dims the page, clicking it closes the pane -->
<div
    class="leftbar-overlay"
    class:is-open={open}
    onclick={close}
    aria-hidden="true"
></div>

<!-- the pane itself -->
<aside
    class="leftbar-pane"
    class:is-open={open}
    inert={open ? undefined : ''}
    aria-label="leftbar"
>
    <!-- <button
        class="leftbar-close"
        type="button"
        onclick={close}
        aria-label="Close leftbar"
    >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
        </svg>
    </button> -->

    <div class="leftbar-body">
        <!-- ...there aint nothin here yet -->
    </div>
</aside>

<!-- the fancy svg button thing -->
<button
    class="leftbar-tab"
    class:is-open={open}
    type="button"
    onclick={toggle}
    aria-expanded={open}
    aria-label={open ? 'Close leftbar' : 'Open leftbar'}
>
    <span class="leftbar-tab-icon" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
    </span>
</button>