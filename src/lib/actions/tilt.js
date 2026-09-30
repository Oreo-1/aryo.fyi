/**
 * 3D tilt-on-hover, as a Svelte action.
 *
 *   <div use:tilt={{ max: 14, scale: 1.04, smooth: 0.12 }}>...</div>
 *
 * max    - max rotation in degrees
 * scale  - scale while hovered
 * smooth - lerp factor per frame (lower = floatier)
 */
export function tilt(node, params = {}) {
  let max = 12;
  let hoverScale = 1.02;
  let smooth = 0.12;

  const cur = { x: 0, y: 0, s: 1 };
  const target = { x: 0, y: 0, s: 1 };
  let raf = 0;
  let orientationEnabled = false;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  function configure(p) {
    max = p.max ?? 12;
    hoverScale = p.scale ?? 1.02;
    smooth = p.smooth ?? 0.12;
  }

  function frame() {
    cur.x = lerp(cur.x, target.x, smooth);
    cur.y = lerp(cur.y, target.y, smooth);
    cur.s = lerp(cur.s, target.s, smooth);
    node.style.transform = `perspective(900px) rotateX(${cur.x}deg) rotateY(${cur.y}deg) scale(${cur.s})`;

    const settled =
      Math.abs(cur.x - target.x) < 0.01 &&
      Math.abs(cur.y - target.y) < 0.01 &&
      Math.abs(cur.s - target.s) < 0.001;

    // stop the loop once we've caught up, saves work
    raf = settled ? 0 : requestAnimationFrame(frame);
  }

  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  function onMove(e) {
    const rect = node.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2); // -1 .. 1
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2); // -1 .. 1
    target.x = clamp(y * -max, -max, max);
    target.y = clamp(x * max, -max, max);
    target.s = hoverScale;
    kick();
  }

  function onEnter() {
    target.s = hoverScale;
    kick();
  }

  function onLeave() {
    target.x = 0;
    target.y = 0;
    target.s = 1;
    kick();
  }

  // optional: tilt with device orientation on touch devices.
  // enabled on first touch to dodge permission prompts.
  function onOrientation(ev) {
    if (!orientationEnabled) return;
    const gamma = ev.gamma || 0; // left-right, -90..90
    const beta = ev.beta || 0; // front-back, -180..180
    target.y = clamp((gamma / 45) * max, -max, max);
    target.x = clamp((beta / 45) * -max, -max, max);
    kick();
  }
  const onTouch = () => (orientationEnabled = true);

  configure(params);
  node.addEventListener('mousemove', onMove, { passive: true });
  node.addEventListener('mouseenter', onEnter);
  node.addEventListener('mouseleave', onLeave);
  node.addEventListener('touchstart', onTouch, { once: true });
  window.addEventListener('deviceorientation', onOrientation);

  return {
    update: configure,
    destroy() {
      cancelAnimationFrame(raf);
      node.removeEventListener('mousemove', onMove);
      node.removeEventListener('mouseenter', onEnter);
      node.removeEventListener('mouseleave', onLeave);
      node.removeEventListener('touchstart', onTouch);
      window.removeEventListener('deviceorientation', onOrientation);
    },
  };
}
