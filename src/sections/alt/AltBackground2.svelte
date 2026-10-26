<!-- triangle sea -->

<script>
  import { onMount } from 'svelte';

  // ---- background config ----
  const DARK_MODE = 0x121212;
  const LIGHT_MODE = 0x989898;
  const ACCENT_A = 0x000000;   // tints that drift across the facets; set ACCENT_MIX to 0 for pure greyscale
  const ACCENT_B = 0x000000;
  const ACCENT_MIX = 0.5;
  const SPEED = 1.0;
  const CELL_SIZE = 96;        // triangle size in CSS px
  const EDGE_OPACITY = 0.22;   // the thin lines between facets
  const MAX_DPR = 1.5;         // flat triangles are cheap, but there's no need for 3x on phones
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

  // Low-poly mesh: vertices drift and bob on the CPU, each facet gets one flat color
  // (tilt against a moving light), and the GPU only fills triangles and draws the edges.
  const VERTEX_SHADER = `
    attribute vec2 aPos;
    attribute vec3 aColor;
    attribute vec3 aBary;
    uniform vec2 uSize;
    varying vec3 vColor;
    varying vec3 vBary;

    void main() {
      vColor = aColor;
      vBary = aBary;
      vec2 clip = aPos / uSize * 2.0 - 1.0;
      gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    }
  `;

  const FRAGMENT_SHADER = `
    #ifdef GL_OES_standard_derivatives
    #extension GL_OES_standard_derivatives : enable
    #endif
    precision mediump float;

    uniform vec2 uRes;
    uniform vec3 uDeep;
    uniform vec3 uHigh;
    uniform float uEdge;
    varying vec3 vColor;
    varying vec3 vBary;

    void main() {
      vec3 col = vColor;

      #ifdef GL_OES_standard_derivatives
      float d = min(min(vBary.x, vBary.y), vBary.z);
      float line = 1.0 - smoothstep(0.0, fwidth(d), d);
      col = mix(col, uHigh, line * uEdge);
      #endif

      vec2 uv = gl_FragCoord.xy / uRes;
      float vignette = smoothstep(0.95, 0.15, length((uv - 0.5) * vec2(1.1, 1.3)));
      col = mix(uDeep, col, 0.5 + 0.5 * vignette);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function hexToRgb(hex) {
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
  }

  function toCss(hex) {
    return `#${hex.toString(16).padStart(6, "0")}`;
  }

  // stable per-vertex randomness, so the mesh doesn't reshuffle on resize
  function hash(a, b, c) {
    const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
    return s - Math.floor(s);
  }

  function startBackground(root, canvas, initialColor) {
    let color = hexToRgb(initialColor);
    let tween = null;
    root.style.backgroundColor = toCss(initialColor);

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: true,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });

    // No WebGL: the wrapper's plain background color is the fallback
    if (!gl) {
      return {
        setColor(hex) { root.style.backgroundColor = toCss(hex); },
        destroy() {},
      };
    }

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const accentA = hexToRgb(ACCENT_A);
    const accentB = hexToRgb(ACCENT_B);
    let animating = !reducedMotion.matches;
    let uniforms = null;
    let vertexBuffer = null;
    let baryBuffer = null;
    let raf = 0;
    let lastFrame = 0;
    let lastDraw = 0;
    let time = 0;
    const pointer = [0, 0];
    const pointerTarget = [0, 0];

    // ---- mesh ----
    let width = 0;
    let height = 0;
    let base = null;        // lattice position per vertex (x, y)
    let seeds = null;       // per vertex: jitter x, jitter y, orbit phase, height offset
    let points = null;      // animated x, y, z per vertex
    let faces = null;       // 3 vertex indices per facet
    let glints = null;      // per facet: glint speed (0 = never glints), phase
    let vertexData = null;  // interleaved x, y, r, g, b for every facet corner

    function buildMesh() {
      const rowHeight = CELL_SIZE * 0.866;
      const cols = Math.ceil(width / CELL_SIZE) + 3;
      const rows = Math.ceil(height / rowHeight) + 3;
      const count = cols * rows;

      base = new Float32Array(count * 2);
      seeds = new Float32Array(count * 4);
      points = new Float32Array(count * 3);

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          const gi = i - 1; // start one cell off-screen so the edges never show
          const gj = j - 1;
          base[k * 2] = (gi + (gj & 1 ? 0.5 : 0)) * CELL_SIZE;
          base[k * 2 + 1] = gj * rowHeight;
          seeds[k * 4] = (hash(gi, gj, 1) - 0.5) * 0.5;
          seeds[k * 4 + 1] = (hash(gi, gj, 2) - 0.5) * 0.5;
          seeds[k * 4 + 2] = hash(gi, gj, 3) * Math.PI * 2;
          seeds[k * 4 + 3] = hash(gi, gj, 4) - 0.5;
        }
      }

      const indices = [];
      for (let j = 0; j < rows - 1; j++) {
        for (let i = 0; i < cols - 1; i++) {
          const a = j * cols + i;
          const b = a + 1;
          const c = a + cols;
          const d = c + 1;
          if ((j - 1) & 1) indices.push(a, d, c, a, b, d);
          else indices.push(a, b, c, b, d, c);
        }
      }
      faces = new Uint32Array(indices);

      const faceCount = faces.length / 3;
      glints = new Float32Array(faceCount * 2);
      for (let f = 0; f < faceCount; f++) {
        glints[f * 2] = hash(f, 7, 5) < 0.15 ? 0.3 + hash(f, 8, 6) * 0.6 : 0;
        glints[f * 2 + 1] = hash(f, 9, 7) * Math.PI * 2;
      }

      const bary = new Float32Array(faceCount * 9);
      for (let f = 0; f < faceCount; f++) {
        bary[f * 9] = 1;
        bary[f * 9 + 4] = 1;
        bary[f * 9 + 8] = 1;
      }
      vertexData = new Float32Array(faceCount * 15);

      gl.bindBuffer(gl.ARRAY_BUFFER, baryBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, bary, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertexData.byteLength, gl.DYNAMIC_DRAW);
    }

    function updateMesh(deep, high) {
      const t = time;
      const aspect = width / height;

      // vertices: a fixed jitter, a small orbit, and rolling height waves
      for (let k = 0, n = points.length / 3; k < n; k++) {
        const bx = base[k * 2];
        const by = base[k * 2 + 1];
        const phase = seeds[k * 4 + 2];
        const u = bx / CELL_SIZE;
        const v = by / CELL_SIZE;
        points[k * 3] = bx + (seeds[k * 4] + Math.cos(t * 0.6 + phase) * 0.12) * CELL_SIZE;
        points[k * 3 + 1] = by + (seeds[k * 4 + 1] + Math.sin(t * 0.5 + phase * 1.3) * 0.12) * CELL_SIZE;
        points[k * 3 + 2] = (
          0.6 * Math.sin(u * 0.35 + t * 0.5) * Math.cos(v * 0.3 - t * 0.4) +
          0.4 * Math.sin((u - v) * 0.22 + t * 0.3) +
          seeds[k * 4 + 3] * 0.5
        ) * CELL_SIZE * 0.45;
      }

      // a light that circles slowly (and leans toward the pointer), plus a soft spotlight that wanders
      const angle = t * 0.12;
      const lx = Math.cos(angle) * 0.8 + pointer[0] * 0.5;
      const ly = Math.sin(angle) * 0.8 - pointer[1] * 0.5;
      const spotX = 0.5 + 0.32 * Math.sin(t * 0.13) + pointer[0] * 0.15;
      const spotY = 0.5 + 0.28 * Math.cos(t * 0.1) - pointer[1] * 0.15;
      const aX = 0.25 + 0.2 * Math.sin(t * 0.07);
      const aY = 0.3 + 0.2 * Math.cos(t * 0.09);
      const bX = 0.75 + 0.2 * Math.cos(t * 0.08);
      const bY = 0.7 + 0.2 * Math.sin(t * 0.06);

      for (let f = 0, n = faces.length / 3; f < n; f++) {
        const ia = faces[f * 3] * 3;
        const ib = faces[f * 3 + 1] * 3;
        const ic = faces[f * 3 + 2] * 3;
        const ax = points[ia], ay = points[ia + 1], az = points[ia + 2];
        const bx = points[ib], by = points[ib + 1], bz = points[ib + 2];
        const cx = points[ic], cy = points[ic + 1], cz = points[ic + 2];

        const ux = bx - ax, uy = by - ay, uz = bz - az;
        const vx = cx - ax, vy = cy - ay, vz = cz - az;
        let nx = uy * vz - uz * vy;
        let ny = uz * vx - ux * vz;
        let nz = ux * vy - uy * vx;
        const len = Math.hypot(nx, ny, nz) * (nz < 0 ? -1 : 1);
        nx /= len;
        ny /= len;

        const mx = (ax + bx + cx) / 3 / width;
        const my = (ay + by + cy) / 3 / height;
        const spot = Math.exp(-(((mx - spotX) * aspect) ** 2 + (my - spotY) ** 2) * 3.5);
        const s = Math.min(Math.max(0.38 +(nx * lx + ny * ly) * 1.1 + spot * 0.5, 0), 1);

        const wa = ACCENT_MIX * Math.exp(-(((mx - aX) * aspect) ** 2 + (my - aY) ** 2) * 5) * (0.4 + s);
        const wb = ACCENT_MIX * Math.exp(-(((mx - bX) * aspect) ** 2 + (my - bY) ** 2) * 5) * (0.4 + s);

        const glintSpeed = glints[f * 2];
        const glint = glintSpeed ? Math.max(Math.sin(t * glintSpeed + glints[f * 2 + 1]), 0) ** 200 * 0.7 : 0;

        const o = f * 15;
        for (let ch = 0; ch < 3; ch++) {
          const value =
            deep[ch] + (high[ch] - deep[ch]) * s +
            (accentA[ch] - color[ch]) * 0.6 * wa +
            (accentB[ch] - color[ch]) * 0.6 * wb +
            (high[ch] - deep[ch]) * glint;
          vertexData[o + 2 + ch] = value;
          vertexData[o + 7 + ch] = value;
          vertexData[o + 12 + ch] = value;
        }
        vertexData[o] = ax;
        vertexData[o + 1] = ay;
        vertexData[o + 5] = bx;
        vertexData[o + 6] = by;
        vertexData[o + 10] = cx;
        vertexData[o + 11] = cy;
      }
    }

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
      gl.getExtension("OES_standard_derivatives"); // the facet edges need it; without it you just get facets

      const program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
      gl.bindAttribLocation(program, 0, "aPos");
      gl.bindAttribLocation(program, 1, "aColor");
      gl.bindAttribLocation(program, 2, "aBary");
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn("Background program:", gl.getProgramInfoLog(program));
        uniforms = null;
        return;
      }
      gl.useProgram(program);

      vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 20, 0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 20, 8);

      baryBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, baryBuffer);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

      const loc = (name) => gl.getUniformLocation(program, name);
      uniforms = {
        size: loc("uSize"),
        res: loc("uRes"),
        deep: loc("uDeep"),
        high: loc("uHigh"),
      };
      gl.uniform1f(loc("uEdge"), EDGE_OPACITY);

      if (width && height) buildMesh();
    }

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, MAX_DPR);
      const cssWidth = Math.max(1, canvas.clientWidth);
      const cssHeight = Math.max(1, canvas.clientHeight);
      if (cssWidth === width && cssHeight === height) return;
      width = cssWidth;
      height = cssHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uniforms) buildMesh();
      draw();
    }

    function draw() {
      if (!uniforms || !faces || gl.isContextLost()) return;

      const lum = color[0] * 0.299 + color[1] * 0.587 + color[2] * 0.114;
      const deep = color.map((c) => c * (0.45 + 0.25 * lum));
      const high = color.map((c) => c + (1 - c) * (0.3 + 0.1 * lum));

      updateMesh(deep, high);
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertexData);

      gl.uniform2f(uniforms.size, width, height);
      gl.uniform2f(uniforms.res, canvas.width, canvas.height);
      gl.uniform3fv(uniforms.deep, deep);
      gl.uniform3fv(uniforms.high, high);
      gl.drawArrays(gl.TRIANGLES, 0, faces.length);
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
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    reducedMotion.addEventListener("change", onMotionPreference);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    lastFrame = performance.now();
    schedule();

    return {
      setColor(hex, duration = 225) {
        root.style.backgroundColor = toCss(hex);
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

  /* light film grain, same as Background.svelte, so the facets don't look too clinical through the glass */
  .bg::after {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0.05;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1.4 -0.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
</style>
