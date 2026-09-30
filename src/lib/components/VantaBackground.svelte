<script>
  // Animated background (vanta.js waves on three.js).
  // three + vanta are dynamically imported so they don't block first paint.

  const OPTIONS = {
    mouseControls: true,
    touchControls: true,
    gyroControls: true,
    minHeight: 200.0,
    minWidth: 200.0,
    scale: 1.0,
    scaleMobile: 1.0,
    color: 0x121212,
    shininess: 70,
    waveSpeed: 0.5,
    zoom: 1.1,
  };

  let el;
  let waves;

  $effect(() => {
    let cancelled = false;

    (async () => {
      const [THREE, { default: WAVES }] = await Promise.all([
        import('three'),
        import('vanta/src/vanta.waves.js'),
      ]);
      if (cancelled) return;
      waves = WAVES({ el, THREE, ...OPTIONS });
    })();

    return () => {
      cancelled = true;
      waves?.destroy();
      waves = undefined;
    };
  });

  /** Smoothly fade the wave colour (0xRRGGBB ints). Used by the theme toggle. */
  export function transitionColor(from, to, duration = 225) {
    const start = performance.now();

    function animate(now) {
      if (!waves) return;
      const t = Math.min((now - start) / duration, 1);
      const ch = (shift) => {
        const a = (from >> shift) & 255;
        const b = (to >> shift) & 255;
        return Math.round(a + (b - a) * t);
      };
      waves.setOptions({ color: (ch(16) << 16) | (ch(8) << 8) | ch(0) });
      if (t < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }
</script>

<!-- vanta-bg: purely the animated background, fixed -->
<div id="vanta-bg" bind:this={el}></div>
<!-- dim overlay on top of the background -->
<div class="is-there-a-better-way-to-do-this"></div>
