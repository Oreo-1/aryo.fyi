<script>
  import { onMount } from 'svelte';
  import { pb } from '../pocketbase.js';
 
  onMount(() => {
  (async () => {
    try {
      // 1. 'aryofyi' collection
      const { items } = await pb.collection('aryofyi').getList(1, 1);
      if (!items.length) return;
      
      // 2. items[0].hero_image
      const url = pb.files.getURL(items[0], items[0].hero_image, { thumb: '800x800' });
      document.getElementById('profile-photo').src = url;
    } catch (err) {
      console.warn('pocketbase unavailable, keeping the local photo', err);
    }
  })();
 
    // ah yes, the cycling text
    const ctext = document.querySelectorAll("#initial-pt .cycling-text");
    let current = 0;
 
    function cycleText() {
      const currentText = ctext[current];
 
      currentText.classList.remove("c-active");
      currentText.classList.add("c-exit");
 
      current = (current + 1) % ctext.length;
 
      const nextText = ctext[current];
 
      nextText.classList.remove("c-exit");
 
      setTimeout(() => {
        nextText.classList.add("c-active");
      }, 100);
 
      setTimeout(() => {
        currentText.classList.remove("c-exit");
      }, 700);
    }
 
    const cycleTimer = setInterval(cycleText, 3200);
 
    // tilt handler (profile picture), settings come from the data-tilt-* attributes
    const orientationHandlers = [];
 
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const maxTilt = Number(card.dataset.tiltMax) || 12;
      const scaleOnHover = Number(card.dataset.tiltScale) || 1.02;
      const smooth = Number(card.dataset.tiltSmooth) || 0.12; // lerp factor
      let width = 0, height = 0;
      let cx = 0, cy = 0;
      let targetX = 0, targetY = 0, targetS = 1;
      let rafId = null;
      const cur = { x: 0, y: 0, s: 1 };
 
      function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
      function lerp(a, b, t) { return a + (b - a) * t; }
 
      function onMove(e) {
        const rect = card.getBoundingClientRect();
        width = rect.width; height = rect.height;
        cx = rect.left + width / 2;
        cy = rect.top + height / 2;
        const x = (e.clientX - cx) / (width / 2); // -1 .. 1
        const y = (e.clientY - cy) / (height / 2); // -1 .. 1
        targetX = clamp(y * -maxTilt, -maxTilt, maxTilt);
        targetY = clamp(x * maxTilt, -maxTilt, maxTilt);
        targetS = scaleOnHover;
        if (!rafId) tick();
      }
 
      function tick() {
        rafId = requestAnimationFrame(() => {
          cur.x = lerp(cur.x, targetX, smooth);
          cur.y = lerp(cur.y, targetY, smooth);
          cur.s = lerp(cur.s, targetS, smooth);
          card.style.transform = `perspective(900px) rotateX(${cur.x}deg) rotateY(${cur.y}deg) scale(${cur.s})`;
 
          // stop RAF when near target to save work
          if (
            Math.abs(cur.x - targetX) < 0.01 &&
            Math.abs(cur.y - targetY) < 0.01 &&
            Math.abs(cur.s - targetS) < 0.001
          ) {
            rafId = null;
          } else {
            tick();
          }
        });
      }
 
      function onEnter() {
        card.classList.add('is-hovering');
        targetS = scaleOnHover;
        // kickstart smoothing
        if (!rafId) tick();
      }
 
      function onLeave() {
        // animate back to neutral smoothly
        targetX = 0; targetY = 0; targetS = 1;
        if (!rafId) tick();
        card.classList.remove('is-hovering');
      }
 
      card.addEventListener('mousemove', onMove, { passive: true });
      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);
 
      // optional: mobile tilt support (device orientation)
      if (window.DeviceOrientationEvent) {
        let enabled = false;
        function handleOrientation(ev) {
          if (!enabled) return;
          const gamma = ev.gamma || 0; // left-to-right tilt [-90,90]
          const beta = ev.beta || 0; // front-to-back tilt [-180,180]
          // normalize and map to small tilt values
          targetY = clamp((gamma / 45) * maxTilt, -maxTilt, maxTilt);
          targetX = clamp((beta / 45) * -maxTilt, -maxTilt, maxTilt);
          if (!rafId) tick();
        }
        // enable on first touch to avoid permission issues
        card.addEventListener('touchstart', () => { enabled = true; }, { once: true });
        window.addEventListener('deviceorientation', handleOrientation);
        orientationHandlers.push(handleOrientation);
      }
    });
 
    return () => {
      clearInterval(cycleTimer);
      orientationHandlers.forEach((h) => window.removeEventListener('deviceorientation', h));
    };
  });
</script>


<!-- lowkey a bit hacky -->
<section class="vh-100 d-flex align-items-center justify-content-center text-center" style="position: relative; z-index: 2;" id="initial-pt">

    <div class="container"> 
        <div class="row align-items-center justify-content-center text-md-start">
            <div class="col-12 col-md-6">
                <h1 class="display-2 fw-bold kewl-gradient-text">Aryo Karel M.</h1>
                <!-- <p class="fs-4 fw-bold">Operating System | Fullstack Developer | UI/UX Designer</p> -->
                <div class="cycling-text-wrapper">
                    <p class="display-4 kewl-gradient-text cycling-text c-active">System Administration</p>
                    <p class="display-4 kewl-gradient-text cycling-text">DevOps</p>
                    <p class="display-4 kewl-gradient-text cycling-text">Operating System</p>
                    <p class="display-4 kewl-gradient-text cycling-text">Linux Enthusiast</p>
                    <p class="display-4 kewl-gradient-text cycling-text">Mobile Development</p>
                    <p class="display-4 kewl-gradient-text cycling-text">Web Development</p>
                </div>

                <!-- <hr class="border-2 opacity-25"> -->

                <p class="fs-5">
                    Informatics student with interests in system administration,
                    DevOps, and full-stack development.
                    <!-- I primarily develop in linux. -->
                </p>

                <p class="fs-3 fw-bold mt-5">Find me on</p>
                <div class="d-flex justify-content-center justify-content-md-start gap-3 mt-3 social-icons-wrapper">
                    <a href="https://www.linkedin.com/in/aryo-karel-merentek/" target="_blank" class="social-icon" alt="linkedin-icon">
                        <img src="/assets/icons/linkedin-icon.svg" alt="linkedin-icon">
                    </a>
                    <a href="https://instagram.com/aryo.km" target="_blank" class="social-icon">
                        <img src="/assets/icons/Instagram_logo_2016.svg" alt="instagram-icon">
                    </a>
                    <a href="https://github.com/Oreo-1" target="_blank" class="social-icon" alt="github-icon">
                        <img src="/assets/icons/github-icon.svg" class="invert-color" alt="github-icon">
                    </a>
                </div>
            </div>
            <div class="col-12 col-md-4 justify-content-center profile-img-wrapper tilt-card"
                data-tilt
                data-tilt-max="14"
                data-tilt-scale="1.04"
                data-tilt-smooth="0.12">
                <img id="profile-photo" src="/assets/anak_alim.png" class="rounded-profile-img mx-auto d-block" alt="me">
            </div>
        </div>
    </div>

</section>
