<!-- 
alt Background.svelte: a WebGL shader that draws a moving water surface with a light that follows the mouse.
instead of the current one using three.js (vanta.js)
-->

<script>
  import { onMount } from 'svelte';

  // ============================================================================
  // CONFIG: tweak the look / cost here
  // ============================================================================
  const BG = {
    renderScale: 0.5,   // canvas resolution vs. its CSS size. 0.5 = a quarter of the pixels.
                        // the output is soft anyway, and the browser upscales it for free
    maxFps: 30,         // waves this slow don't need 60 (or 144). halves GPU work + backdrop-blur work
    dim: 0.6,           // replaces the old rgba(0,0,0,.4) overlay div (1 - 0.4 = 0.6)
    shininess: 12,      // size of the highlight (higher = tighter, glossier; lower = softer satin)
    shine: 0.34,        // brightness of the highlight
    speed: 1.0,         // wave speed multiplier
  };

  // ============================================================================
  // SHADERS
  // The old Vanta setup moved ~8,000 vertices in JavaScript every frame, recomputed all
  // normals on the CPU, and re-uploaded the mesh to the GPU. Here the whole "surface" is a
  // formula evaluated per pixel on the GPU: a sum of travelling sine waves gives a height
  // field; its slope gives the normal; one light that follows the mouse gives the sheen.
  // Zero per-frame JS work apart from setting a few uniforms.
  // ============================================================================
  const VERT = `
    attribute vec2 aPos;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
  `;

  const FRAG = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif

    uniform vec2  uRes;
    uniform float uTime;
    uniform vec2  uLight;     // light position, 0..1, y up
    uniform vec3  uColor;     // surface colour 0..1
    uniform float uDim;
    uniform float uShininess;
    uniform float uShine;

    // one travelling sine wave; accumulates its slope into d
    void wave(vec2 p, float ang, float freq, float amp, float speed, inout vec2 d) {
      vec2  dir = vec2(cos(ang), sin(ang));
      float ph  = dot(p, dir) * freq + uTime * speed;
      d += amp * freq * cos(ph) * dir;
    }

    void main() {
      float aspect = uRes.x / uRes.y;
      vec2  p = (gl_FragCoord.xy / uRes - 0.5) * vec2(aspect, 1.0) * 3.2;

      // gentle domain warp so the bands look organic rather than ruler-straight
      p += 0.10 * vec2(sin(p.y * 1.6 + uTime * 0.21), cos(p.x * 1.3 - uTime * 0.17));

      vec2 d = vec2(0.0);
      // one dominant swell + smaller cross-chop (args: angle, frequency, amplitude, speed)
      wave(p, 0.55, 1.35, 0.55, 0.42, d);
      wave(p, 2.20, 1.90, 0.20, 0.31, d);
      wave(p, 3.75, 2.60, 0.10, 0.55, d);
      wave(p, 5.10, 3.40, 0.06, 0.37, d);

      vec3 n = normalize(vec3(-d * 1.0, 1.0));   // multiplier = how deep the folds look

      vec2 lp = (uLight - 0.5) * vec2(aspect, 1.0) * 3.2;
      vec3 L  = normalize(vec3(lp - p, 1.1));
      vec3 H  = normalize(L + vec3(0.0, 0.0, 1.0));

      float diff   = max(dot(n, L), 0.0);
      float spec   = pow(max(dot(n, H), 0.0), uShininess);
      float reach  = 1.0 / (1.0 + 0.10 * dot(lp - p, lp - p)); // highlight fades away from the light

      vec3 col = uColor * (0.55 + 0.75 * diff) + vec3(uShine) * spec * reach;
      col += vec3(0.10) * pow(1.0 - n.z, 2.0);   // faint sheen on the slopes so folds read even far from the light
      col *= uDim;

      // 1/255 dither so dark gradients don't band
      float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
      col += (noise - 0.5) / 255.0;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // ============================================================================
  // component
  // ============================================================================
  let canvas;

  // set by the effect below; the dark/light toggle calls it
  let setColor = () => {};

  onMount(() => {
    let isDarkMode = true;

    const DARK_MODE = 0x121212;
    const LIGHT_MODE = 0x989898;

    const button = document.getElementById("toggle-darkmode-lightmode");

    // ---- animated background ----
    const hexToRgb = (hex) => [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
    let color = hexToRgb(DARK_MODE);

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

    let gl, program, u;           // u = uniform locations
    let raf = 0, running = false;
    let lastDraw = 0;
    const t0 = performance.now();

    // light follows a real mouse; otherwise it drifts on its own (touch screens, idle)
    let mouse = null;
    const light = { x: 0.3, y: 0.7 };

    function compile(type, src) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(sh);
        gl.deleteShader(sh);
        throw new Error('shader: ' + log);
      }
      return sh;
    }

    function setup() {
      program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(program));
      gl.useProgram(program);

      // one oversized triangle covers the screen (cheaper than a quad, no seam)
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, 'aPos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      u = {};
      for (const name of ['uRes', 'uTime', 'uLight', 'uColor', 'uDim', 'uShininess', 'uShine']) {
        u[name] = gl.getUniformLocation(program, name);
      }
      gl.uniform1f(u.uDim, BG.dim);
      gl.uniform1f(u.uShininess, BG.shininess);
      gl.uniform1f(u.uShine, BG.shine);
      resize(true);
    }

    function resize(force) {
      const w = Math.max(1, Math.round(canvas.clientWidth * BG.renderScale));
      const h = Math.max(1, Math.round(canvas.clientHeight * BG.renderScale));
      // mobile URL-bar show/hide fires lots of tiny resizes: ignore if nothing really changed
      if (!force && w === canvas.width && h === canvas.height) return false;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u.uRes, w, h);
      return true;
    }

    function draw(now) {
      const t = ((now - t0) / 1000) * BG.speed;

      // where the light wants to be, then ease toward it
      const tx = mouse ? mouse.x : 0.5 + 0.30 * Math.cos(t * 0.11);
      const ty = mouse ? mouse.y : 0.62 + 0.22 * Math.sin(t * 0.14);
      light.x += (tx - light.x) * 0.06;
      light.y += (ty - light.y) * 0.06;

      gl.uniform1f(u.uTime, t);
      gl.uniform2f(u.uLight, light.x, light.y);
      gl.uniform3f(u.uColor, color[0], color[1], color[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (now - lastDraw < 1000 / BG.maxFps - 4) return; // fps cap (rAF itself follows the monitor)
      lastDraw = now;
      draw(now);
    }

    function start() {
      if (running || !gl) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    // used by the toggle: repaint right away if the loop isn't running (reduced motion)
    setColor = (hex) => {
      color = hexToRgb(hex);
      if (gl && !running) draw(performance.now());
    };

    function applyMotionPreference() {
      if (reduceMotion.matches) {
        stop();
        draw(t0 + 4000); // one still frame
      } else {
        start();
      }
    }

    // failIfMajorPerformanceCaveat: if the browser would fall back to *software* WebGL
    // (no GPU), give up and keep the flat css background colour instead of crawling at 3 fps.
    // powerPreference 'low-power': use the integrated GPU on laptops with two.
    gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      failIfMajorPerformanceCaveat: true,
    });

    let ro, onPointerMove;

    if (gl) {
      try {
        setup();

        ro = new ResizeObserver(() => {
          if (resize(false) && !running) draw(performance.now());
        });
        ro.observe(canvas);

        onPointerMove = (e) => {
          if (e.pointerType !== 'mouse') return;
          mouse = { x: e.clientX / window.innerWidth, y: 1 - e.clientY / window.innerHeight };
        };
        window.addEventListener('pointermove', onPointerMove, { passive: true });

        reduceMotion.addEventListener('change', applyMotionPreference);

        // mobile GPUs drop contexts now and then (memory pressure, tab switches)
        canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stop(); });
        canvas.addEventListener('webglcontextrestored', () => { setup(); applyMotionPreference(); });

        applyMotionPreference();
      } catch (err) {
        console.warn('background shader failed, keeping the flat colour', err);
        gl = null;
      }
    }

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

        setColor(color);

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
      stop();
      ro?.disconnect();
      if (onPointerMove) window.removeEventListener('pointermove', onPointerMove);
      reduceMotion.removeEventListener('change', applyMotionPreference);
      setColor = () => {};
    };
  });
</script>

<!-- the animated background: one fixed canvas. the dimming that the old
     .is-there-a-better-way-to-do-this overlay div did now happens inside the shader (BG.dim) -->
<canvas id="vanta-bg" bind:this={canvas} aria-hidden="true"></canvas>

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