<script>
  import { onMount } from 'svelte';

  // ---- background config ----
  const DARK_MODE = 0x121212;
  const LIGHT_MODE = 0x989898;
  const ACCENT_A = 0x6c63ff;   // a few triangles + two soft glows; set ACCENT_MIX to 0 for pure greyscale
  const ACCENT_B = 0x20c3b0;
  const ACCENT_MIX = 0.5;
  const SPEED = 1.0;
  const MAX_TRIANGLES = 24;    // phones get ~12, a 1080p screen gets the max
  const MIN_SIZE = 22;         // px
  const MAX_SIZE = 180;
  const OUTLINE_SHARE = 0.35;  // the rest are filled

  let root;
  let layer;

  onMount(() => {
    let isDarkMode = true;

    const button = document.getElementById("toggle-darkmode-lightmode");

    // ---- animated background ----
    const background = startBackground(root, layer, DARK_MODE);

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

    function onToggle() {
      isDarkMode = !isDarkMode;

      background.setColor(isDarkMode ? DARK_MODE : LIGHT_MODE);

      isDarkMode ? setIconMoon() : setIconSun();
    }

    button.addEventListener("click", onToggle);

    setIconMoon(); // start in dark mode

    return () => {
      button.removeEventListener("click", onToggle);
      background.destroy();
    };
  });

  const SVG_NS = "http://www.w3.org/2000/svg";
  const EDGE_MARGIN = 80; // spawn/despawn off-screen, with room for mobile URL bars resizing the viewport

  function hexToRgb(hex) {
    return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
  }

  function toCss(rgb, alpha = 1) {
    return `rgb(${rgb.map(Math.round).join(" ")} / ${alpha})`;
  }

  // Each triangle is a tiny SVG in a div moved only by `transform` through the Web Animations API,
  // so the browser runs the motion on the compositor: no canvas and no per-frame JavaScript.
  function startBackground(root, layer, initialColor) {
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const accentA = hexToRgb(ACCENT_A);
    const accentB = hexToRgb(ACCENT_B);
    let width = 0;
    let height = 0;
    let resizeTimer = 0;

    root.style.setProperty("--tri-accent-a", toCss(accentA));
    root.style.setProperty("--tri-accent-b", toCss(accentB));
    root.style.setProperty("--glow-a", toCss(accentA, ACCENT_MIX * 0.35));
    root.style.setProperty("--glow-b", toCss(accentB, ACCENT_MIX * 0.3));
    setColor(initialColor);

    function setColor(hex) {
      const base = hexToRgb(hex);
      root.style.backgroundColor = toCss(base);
      root.style.setProperty("--tri", toCss(base.map((c) => c + (255 - c) * 0.55)));
    }

    function createTriangle(x, size) {
      // the motion goes on a plain div: Chrome won't run transform animations on SVG elements on the compositor
      const triangle = document.createElement("div");
      triangle.className = "triangle";
      triangle.style.width = `${size}px`;
      triangle.style.height = `${size}px`;
      triangle.style.left = `${x - size / 2}px`;

      const svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("viewBox", "-50 -50 100 100");
      triangle.append(svg);

      // irregular triangle: three corners roughly 120° apart
      const start = Math.random() * Math.PI * 2;
      const points = [0, 1, 2].map((i) => {
        const angle = start + (i * Math.PI * 2) / 3 + (Math.random() - 0.5);
        const radius = 34 + Math.random() * 12;
        return `${(Math.cos(angle) * radius).toFixed(1)},${(Math.sin(angle) * radius).toFixed(1)}`;
      });

      const polygon = document.createElementNS(SVG_NS, "polygon");
      polygon.setAttribute("points", points.join(" "));

      const outline = Math.random() < OUTLINE_SHARE;
      if (outline) {
        polygon.setAttribute("fill", "none");
        polygon.setAttribute("stroke", "currentColor");
        polygon.setAttribute("stroke-width", "1.5");
        polygon.setAttribute("stroke-linejoin", "round");
        polygon.setAttribute("vector-effect", "non-scaling-stroke");
      } else {
        polygon.setAttribute("fill", "currentColor");
      }
      svg.append(polygon);

      const tone = Math.random();
      triangle.style.color =
        tone < ACCENT_MIX * 0.3 ? "var(--tri-accent-a)" :
        tone < ACCENT_MIX * 0.6 ? "var(--tri-accent-b)" :
        "var(--tri)";
      // big ones stay faint so they read as depth, not clutter
      const fade = 1 - ((size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)) * 0.35;
      triangle.style.opacity = ((outline ? 0.35 + Math.random() * 0.3 : 0.14 + Math.random() * 0.18) * fade).toFixed(3);

      const rotation = Math.random() * 360;

      if (reducedMotion.matches) {
        triangle.style.transform = `translate3d(0, ${Math.random() * height}px, 0) rotate(${rotation}deg)`;
        return triangle;
      }

      // float upward; bigger = "closer" = faster, with a gentle sideways sway and a slow spin
      const startY = height + EDGE_MARGIN;
      const endY = -size - EDGE_MARGIN;
      const speed = (10 + size * 0.14) * SPEED; // px per second
      const duration = ((startY - endY) / speed) * 1000;
      const sway = 10 + Math.random() * 30;
      const swayWaves = Math.random() < 0.5 ? 1 : 2; // whole waves, so each loop starts where the last ended
      const phase = Math.random() * Math.PI * 2;
      const spin = (Math.random() - 0.5) * 240;

      const keyframes = Array.from({ length: 13 }, (_, k) => {
        const t = k / 12;
        const dx = sway * Math.sin(phase + t * Math.PI * 2 * swayWaves);
        const y = startY + (endY - startY) * t;
        return { transform: `translate3d(${dx.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(rotation + spin * t).toFixed(1)}deg)` };
      });

      triangle.animate(keyframes, {
        duration,
        delay: -Math.random() * duration, // start mid-flight, so the screen is already full
        iterations: Infinity,
        easing: "linear",
      });

      return triangle;
    }

    function build() {
      layer.replaceChildren(); // removing the elements also cancels their animations
      width = root.clientWidth;
      height = root.clientHeight;
      if (!width || !height) return;

      const count = Math.round(Math.min(Math.max(10 + (width * height) / 150000, 12), MAX_TRIANGLES));
      const maxSize = Math.min(MAX_SIZE, Math.min(width, height) * 0.45);

      for (let i = 0; i < count; i++) {
        const size = MIN_SIZE + (maxSize - MIN_SIZE) * Math.random() ** 1.6; // mostly small, a few big
        const x = ((i + Math.random()) / count) * width; // spread across the width instead of clumping
        layer.append(createTriangle(x, size));
      }
    }

    function onResize() {
      // ignore the small height changes from mobile URL bars; rebuild on real resizes / rotation
      const widthChanged = root.clientWidth !== width;
      const heightChanged = Math.abs(root.clientHeight - height) > height * 0.25;
      if (!widthChanged && !heightChanged) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    }

    const resizeObserver = new ResizeObserver(onResize);

    build();
    resizeObserver.observe(root);
    reducedMotion.addEventListener("change", build);

    return {
      setColor,
      destroy() {
        clearTimeout(resizeTimer);
        resizeObserver.disconnect();
        reducedMotion.removeEventListener("change", build);
        layer.replaceChildren();
      },
    };
  }
</script>

<!-- vanta-bg: purely the animated background, fixed -->
<div id="vanta-bg" class="bg" bind:this={root} aria-hidden="true">
  <div class="layer" bind:this={layer}></div>
</div>
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

<style>
  .bg {
    position: fixed;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
    transition: background-color 225ms ease;
    /* static, painted once: gives the glass a bit of color to diffuse */
    background-image:
      radial-gradient(60% 50% at 20% 25%, var(--glow-a), transparent 70%),
      radial-gradient(55% 45% at 80% 80%, var(--glow-b), transparent 70%);
  }

  .layer {
    position: absolute;
    inset: 0;
  }

  /* the triangles are created in JS, so the selector has to be global */
  .layer :global(.triangle) {
    position: absolute;
    top: 0;
    transition: color 225ms ease;
  }

  .layer :global(.triangle svg) {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
</style>
