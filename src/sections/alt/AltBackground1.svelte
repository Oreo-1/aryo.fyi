<script>
  import { onMount } from 'svelte';

  // ---- background config ----
  const DARK_MODE = 0x121212;
  const LIGHT_MODE = 0x989898;
  const ACCENT_A = 0x6c63ff;   // tints that bleed through the glass; set ACCENT_MIX to 0 for pure greyscale
  const ACCENT_B = 0x20c3b0;
  const ACCENT_MIX = 0.35;
  const SPEED = 1.0;
  const RENDER_SCALE = 0.35;   // the field is soft, so render it small and let CSS upscale it
  const MAX_FPS = 30;

  let root;
  let canvas;

  onMount(() => {
    let isDarkMode = true;

    const button = document.getElementById("toggle-darkmode-lightmode");

    // ---- animated background ----
    const background = startBackground(root, canvas, DARK_MODE);

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

  // Domain-warped fbm ("flowing silk/smoke"), drawn as one fullscreen triangle.
  const VERTEX_SHADER = `
    attribute vec2 aPos;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
  `;

  const FRAGMENT_SHADER = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif

    uniform vec2 uRes;
    uniform float uTime;
    uniform vec2 uPointer;
    uniform vec3 uBase;
    uniform vec3 uAccentA;
    uniform vec3 uAccentB;
    uniform float uAccentMix;

    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    float fbm(vec2 p) {
      const mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = m * p;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uRes;
      vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y) * 1.8;
      p += uPointer * 0.12;
      float t = uTime * 0.05;

      vec2 q = vec2(fbm(p + vec2(0.0, t)),
                    fbm(p + vec2(5.2, 1.3) - t));
      vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + 0.8 * t),
                    fbm(p + 3.0 * q + vec2(8.3, 2.8) - 0.6 * t));
      float f = fbm(p + 3.0 * r);

      float lum = dot(uBase, vec3(0.299, 0.587, 0.114));
      vec3 deep = uBase * 0.45;
      vec3 high = mix(uBase, vec3(1.0), 0.3 + 0.1 * lum);

      vec3 col = mix(deep, uBase, smoothstep(0.15, 0.55, f));
      col = mix(col, mix(uBase, uAccentA, 0.6), uAccentMix * smoothstep(0.35, 1.05, length(q)));
      col = mix(col, mix(uBase, uAccentB, 0.6), uAccentMix * smoothstep(0.45, 0.85, r.y) * 0.8);
      col = mix(col, high, smoothstep(0.45, 0.9, f * (0.6 + 0.6 * r.x)) * 0.85);

      // thin bright folds where the warped field crests: the "silk" sheen
      float sheen = 1.0 - abs(f * (0.6 + 0.6 * r.x) - 0.62) * 9.0;
      col += (high - uBase) * 0.45 * smoothstep(0.0, 1.0, sheen) * smoothstep(0.3, 0.8, r.x);

      float vignette = smoothstep(0.95, 0.15, length((uv - 0.5) * vec2(1.1, 1.3)));
      col = mix(deep, col, 0.45 + 0.55 * vignette);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function hexToRgb(hex) {
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
  }

  function startBackground(root, canvas, initialColor) {
    let color = hexToRgb(initialColor);
    let tween = null;
    root.style.backgroundColor = `#${initialColor.toString(16).padStart(6, "0")}`;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });

    // No WebGL: the wrapper's plain background color is the fallback
    if (!gl) {
      return {
        setColor(hex) { root.style.backgroundColor = `#${hex.toString(16).padStart(6, "0")}`; },
        destroy() {},
      };
    }

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let animating = !reducedMotion.matches;
    let uniforms = null;
    let raf = 0;
    let lastFrame = 0;
    let lastDraw = 0;
    let time = 0;
    const pointer = [0, 0];
    const pointerTarget = [0, 0];

    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("Background shader:", gl.getShaderInfoLog(shader));
      }
      return shader;
    }

    function init() {
      const program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
      gl.bindAttribLocation(program, 0, "aPos");
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn("Background program:", gl.getProgramInfoLog(program));
        uniforms = null;
        return;
      }
      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      const loc = (name) => gl.getUniformLocation(program, name);
      uniforms = {
        res: loc("uRes"),
        time: loc("uTime"),
        pointer: loc("uPointer"),
        base: loc("uBase"),
      };
      gl.uniform3fv(loc("uAccentA"), hexToRgb(ACCENT_A));
      gl.uniform3fv(loc("uAccentB"), hexToRgb(ACCENT_B));
      gl.uniform1f(loc("uAccentMix"), ACCENT_MIX);
    }

    function resize() {
      const width = Math.max(1, Math.round(canvas.clientWidth * RENDER_SCALE));
      const height = Math.max(1, Math.round(canvas.clientHeight * RENDER_SCALE));
      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      draw();
    }

    function draw() {
      if (!uniforms || gl.isContextLost()) return;
      gl.uniform2f(uniforms.res, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, time);
      gl.uniform2fv(uniforms.pointer, pointer);
      gl.uniform3fv(uniforms.base, color);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("ready");
    }

    function frame(now) {
      raf = 0;
      const dt = Math.min((now - lastFrame) / 1000, 0.1); // don't jump after the tab was hidden
      lastFrame = now;

      if (tween) {
        const t = Math.min((now - tween.start) / tween.duration, 1);
        const eased = t * t * (3 - 2 * t);
        color = tween.from.map((from, i) => from + (tween.to[i] - from) * eased);
        if (t === 1) tween = null;
      }

      if (animating) {
        time += dt * SPEED;
        const follow = 1 - Math.exp(-dt * 2.5);
        pointer[0] += (pointerTarget[0] - pointer[0]) * follow;
        pointer[1] += (pointerTarget[1] - pointer[1]) * follow;
      }

      if (tween || !animating || now - lastDraw >= 1000 / MAX_FPS - 2) {
        lastDraw = now;
        draw();
      }

      schedule();
    }

    function schedule() {
      if (!raf && (animating || tween) && !gl.isContextLost()) {
        raf = requestAnimationFrame(frame);
      }
    }

    function onPointerMove(e) {
      pointerTarget[0] = (e.clientX / innerWidth) * 2 - 1;
      pointerTarget[1] = 1 - (e.clientY / innerHeight) * 2;
    }

    function onMotionPreference() {
      animating = !reducedMotion.matches;
      draw();
      schedule();
    }

    function onContextLost(e) {
      e.preventDefault(); // allows the browser to restore it
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function onContextRestored() {
      init();
      draw();
      schedule();
    }

    const resizeObserver = new ResizeObserver(resize);

    init();
    resizeObserver.observe(canvas);
    resize();
    draw();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    reducedMotion.addEventListener("change", onMotionPreference);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    lastFrame = performance.now();
    schedule();

    return {
      setColor(hex, duration = 225) {
        root.style.backgroundColor = `#${hex.toString(16).padStart(6, "0")}`;
        tween = { from: color.slice(), to: hexToRgb(hex), start: performance.now(), duration };
        schedule();
      },
      destroy() {
        cancelAnimationFrame(raf);
        raf = 0;
        resizeObserver.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        reducedMotion.removeEventListener("change", onMotionPreference);
        canvas.removeEventListener("webglcontextlost", onContextLost);
        canvas.removeEventListener("webglcontextrestored", onContextRestored);
        gl.getExtension("WEBGL_lose_context")?.loseContext(); // free the GPU context right away (HMR, route changes)
      },
    };
  }
</script>

<!-- vanta-bg: purely the animated background, fixed -->
<div id="vanta-bg" class="bg" bind:this={root} aria-hidden="true">
  <canvas bind:this={canvas}></canvas>
</div>
<!-- <div class="is-there-a-better-way-to-do-this"></div> -->

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
  }

  .bg canvas {
    display: block;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 900ms ease;
  }

  .bg :global(canvas.ready) {
    opacity: 1;
  }

  /* film grain: hides gradient banding from the upscale and gives the glass something to diffuse */
  .bg::after {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0.07;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1.4 -0.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
</style>
