<script>
  import { onMount } from 'svelte';

  // three.js + vanta are loaded after the page shows up (they're big)
  let effect;

  onMount(() => {
    let isDarkMode = true;

    const DARK_MODE = 0x121212;
    const LIGHT_MODE = 0x989898;

    const button = document.getElementById("toggle-darkmode-lightmode");

    // ---- animated background ----
    let destroyed = false;

    (async () => {
      const THREE = await import('three');
      const { default: WAVES } = await import('vanta/src/vanta.waves.js');
      if (destroyed) return;

      effect = WAVES({
        THREE,
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: true,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x121212,
        shininess: 70,
        waveSpeed: 0.5,
        zoom: 1.1
      });
    })();

    function smoothSwitch(from, to, duration = 225) {
      const start = performance.now();

      function animate(now) {
        const t = Math.min((now - start) / duration, 1);

        const r =
          ((from >> 16) & 255) +
          ((((to >> 16) & 255) - ((from >> 16) & 255)) * t);

        const g =
          ((from >> 8) & 255) +
          ((((to >> 8) & 255) - ((from >> 8) & 255)) * t);

        const b =
          (from & 255) +
          (((to & 255) - (from & 255)) * t);

        const color =
          (Math.round(r) << 16) |
          (Math.round(g) << 8) |
          Math.round(b);

        effect?.setOptions({ color });

        if (t < 1) {
          requestAnimationFrame(animate);
        }
      }

      requestAnimationFrame(animate);
    }

    // ---- sun/moon icon ----
    const iconCore = document.getElementById("core");
    const iconRays = document.getElementById("rays");
    const iconCrater = document.getElementById("crater");

    function setIconSun() {
      iconCore.style.r = "5px";
      iconRays.style.opacity = "1";
      iconRays.style.transform = "rotate(0deg) scale(1)";
      iconCrater.style.opacity = "0";
      iconCrater.setAttribute("cx", "16");
      iconCrater.setAttribute("cy", "9");
      iconCrater.setAttribute("r", "3.5");
      button.setAttribute("aria-label", "Switch to dark mode");
    }

    function setIconMoon() {
      iconCore.style.r = "7px";
      iconRays.style.opacity = "0";
      iconRays.style.transform = "rotate(90deg) scale(0.6)";
      iconCrater.style.opacity = "1";
      iconCrater.setAttribute("cx", "15");
      iconCrater.setAttribute("cy", "8");
      iconCrater.setAttribute("r", "4");
      button.setAttribute("aria-label", "Switch to light mode");
    }

    button.addEventListener("click", () => {
      const from = isDarkMode ? DARK_MODE : LIGHT_MODE;
      const to = isDarkMode ? LIGHT_MODE : DARK_MODE;

      smoothSwitch(from, to);

      isDarkMode = !isDarkMode;

      isDarkMode ? setIconMoon() : setIconSun();
    });

    setIconMoon(); // start in dark mode

    return () => {
      destroyed = true;
      effect?.destroy();
    };
  });
</script>

<!-- vanta-bg: purely the animated background, fixed -->
<div id="vanta-bg"></div>
<div class="is-there-a-better-way-to-do-this"></div>

<!-- darkmode lightmode toggle (FIX soon) -->
<button type="button" id="toggle-darkmode-lightmode" aria-label="Toggle dark mode" aria-pressed="false" class="top-0 end-0 tdmlm-btn FIX-SOON">
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" style="overflow:visible">
    <circle id="core" cx="12" cy="12" r="5" fill="currentColor"/>
    <g id="rays" style="transform-origin:12px 12px;transition:opacity 0.35s,transform 0.5s cubic-bezier(.4,0,.2,1)">
      <line x1="12" y1="2"  x2="12" y2="5"  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="2"  y1="12" x2="5"  y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4.22"  y1="4.22"  x2="6.34"  y2="6.34"  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4.22"  y1="19.78" x2="6.34"  y2="17.66" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="17.66" y1="6.34"  x2="19.78" y2="4.22"  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </g>
    <circle id="crater" cx="16" cy="9" r="3.5" style="opacity:0"/>
  </svg>
</button>
