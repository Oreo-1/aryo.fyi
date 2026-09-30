<script>
  // Dark / light toggle. Still hidden via the FIX-SOON class (see app.css),
  // remove that class from the button once light mode is ready.
  const DARK_MODE = 0x121212;
  const LIGHT_MODE = 0x989898;

  /** @type {{ onswitch?: (from: number, to: number) => void }} */
  let { onswitch } = $props();

  let dark = $state(true);

  function toggle() {
    const from = dark ? DARK_MODE : LIGHT_MODE;
    const to = dark ? LIGHT_MODE : DARK_MODE;
    onswitch?.(from, to);
    dark = !dark;
  }
</script>

<button
  type="button"
  id="toggle-darkmode-lightmode"
  aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
  aria-pressed={!dark}
  class="top-0 end-0 tdmlm-btn FIX-SOON"
  onclick={toggle}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" style="overflow:visible">
    <!-- sun core grows into a moon body -->
    <circle id="core" cx="12" cy="12" r="5" fill="currentColor" style:r={dark ? '7px' : '5px'} />
    <g
      id="rays"
      style="transform-origin:12px 12px"
      style:opacity={dark ? 0 : 1}
      style:transform={dark ? 'rotate(90deg) scale(0.6)' : 'rotate(0deg) scale(1)'}
    >
      <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </g>
    <!-- crater cut into the moon -->
    <circle
      id="crater"
      cx={dark ? 15 : 16}
      cy={dark ? 8 : 9}
      r={dark ? 4 : 3.5}
      style:opacity={dark ? 1 : 0}
    />
  </svg>
</button>
