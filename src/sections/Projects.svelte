<script>
  // Infinite, draggable marquee. Replaces Swiper (Autoplay + FreeMode + loop).
  //
  // The auto-scroll is a single Web Animations API `translateX` animation, so it runs on the
  // compositor thread and costs no JavaScript per frame. JS only runs on input (drag / hover /
  // focus) and to pause the animation when it isn't needed.
  //
  // Expected markup:
  //   <div use:marquee>
  //     <div class="marquee-track">
  //       <div class="marquee-group"> ...slides... </div>
  //       <div class="marquee-group"> ...same slides again (loop copy)... </div>
  //     </div>
  //   </div>
  function marquee(node, { secondsPerSlide = 15, resumeDelay = 2000 } = {}) {
    const track = node.firstElementChild;
    const [group, copy] = track.children;
    const duration = group.childElementCount * secondsPerSlide * 1000; // ms per full loop

    // the copy only exists to make the loop seamless: keep it out of the tab order
    copy.querySelectorAll('a, button').forEach((el) => (el.tabIndex = -1));

    // -50% of the track = exactly one group, so the loop point is invisible
    const anim = track.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
      { duration, iterations: Infinity, easing: 'linear' }
    );

    // the marquee runs only while nothing is holding it
    const holds = new Set();
    const hold = (reason, on) => {
      on ? holds.add(reason) : holds.delete(reason);
      holds.size ? anim.pause() : anim.play();
    };

    const ac = new AbortController(); // one abort() removes every listener below
    const listen = (target, type, fn, opts) =>
      target.addEventListener(type, fn, { ...opts, signal: ac.signal });

    // --- things that pause it -------------------------------------------------
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
    hold('reduced-motion', reduceMotion.matches);
    listen(reduceMotion, 'change', (e) => hold('reduced-motion', e.matches));

    // don't animate (and blur 15px of backdrop-filter) while scrolled out of view
    // (entries can arrive batched, oldest first, so only the last one reflects the current state)
    const io = new IntersectionObserver((entries) =>
      hold('offscreen', !entries[entries.length - 1].isIntersecting)
    );
    io.observe(node);

    // pause on mouse hover (touch handled below)
    listen(node, 'pointerenter', (e) => e.pointerType === 'mouse' && hold('hover', true));
    listen(node, 'pointerleave', (e) => e.pointerType === 'mouse' && hold('hover', false));

    // pause while a link/button is focused with the keyboard
    listen(node, 'focusin', (e) => hold('focus', e.target.matches(':focus-visible')));
    listen(node, 'focusout', () => hold('focus', false));

    // --- drag / flick -----------------------------------------------------------
    const wrap = (t) => ((t % duration) + duration) % duration;
    let pressed = false, dragging = false, suppressClick = false;
    let startX, startTime, lastX, lastT, velocity, loop, raf, resumeTimer;

    listen(node, 'pointerdown', (e) => {
      if (e.button !== 0) return;
      hold('press', true); // freeze under the finger so taps land on what you aimed at
      cancelAnimationFrame(raf);
      clearTimeout(resumeTimer);
      hold('coast', false);
      hold('wait', false);
      pressed = true;
      dragging = false;
      velocity = 0;
      startX = lastX = e.clientX;
      lastT = e.timeStamp;
    });

    listen(node, 'pointermove', (e) => {
      if (!pressed) return;
      if (!dragging) {
        if (Math.abs(e.clientX - startX) < 6) return; // small movement = still a tap/click
        dragging = true;
        startX = e.clientX;
        startTime = anim.currentTime;
        loop = track.offsetWidth / 2; // px per full loop
        node.setPointerCapture(e.pointerId);
        node.classList.add('is-dragging');
      }
      const dt = e.timeStamp - lastT;
      if (dt > 0) velocity = 0.75 * velocity + 0.25 * ((e.clientX - lastX) / dt); // px/ms
      lastX = e.clientX;
      lastT = e.timeStamp;
      // dragging right moves content right, i.e. rewinds the animation
      anim.currentTime = wrap(startTime - ((e.clientX - startX) / loop) * duration);
    });

    // momentum after a flick (what FreeMode did). Velocity decays exponentially and the distance
    // per frame is integrated exactly, so a janky/slow frame can't make it overshoot.
    const coast = (v) => {
      v = Math.max(-3, Math.min(3, v)); // px/ms; cap so a glitchy timestamp can't launch it
      hold('coast', true);
      let prev = performance.now();
      const step = (now) => {
        const k = Math.exp(-(now - prev) / 300); // velocity falls to 1/e every 300ms
        prev = now;
        anim.currentTime = wrap(anim.currentTime - ((v * 300 * (1 - k)) / loop) * duration);
        v *= k;
        if (Math.abs(v) > 0.02) raf = requestAnimationFrame(step);
        else hold('coast', false);
      };
      raf = requestAnimationFrame(step);
    };

    const release = (e) => {
      if (!pressed) return;
      pressed = false;
      if (dragging) {
        node.classList.remove('is-dragging');
        suppressClick = true; // a drag must not "click" the link it ended on
        setTimeout(() => (suppressClick = false));
        if (e.timeStamp - lastT < 80 && Math.abs(velocity) > 0.05) coast(velocity);
      }
      if (e.pointerType !== 'mouse') {
        // finger / pen: stay put for a moment, then carry on (mouse resumes on mouseleave)
        hold('wait', true);
        resumeTimer = setTimeout(() => hold('wait', false), resumeDelay);
      }
      hold('press', false);
    };
    listen(window, 'pointerup', release);
    listen(window, 'pointercancel', release);

    listen(node, 'click', (e) => {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, { capture: true });
    listen(node, 'dragstart', (e) => e.preventDefault()); // no native image/link ghost-drag

    return {
      destroy() {
        ac.abort();
        io.disconnect();
        anim.cancel();
        cancelAnimationFrame(raf);
        clearTimeout(resumeTimer);
      },
    };
  }
</script>

<!-- one marquee row. `cards` is rendered twice: the second copy makes the loop seamless -->
{#snippet row(cards)}
    <div class="marquee projects-section-card pt-3" use:marquee>
        <div class="marquee-track">
            <div class="marquee-group">{@render cards()}</div>
            <div class="marquee-group" aria-hidden="true">{@render cards()}</div>
        </div>
    </div>
{/snippet}

<!-- row 1 cards -->
{#snippet firstRow()}
            <!-- project card 1 -->
            <div class="marquee-slide">
                <div class="card h-100">
                    <img src="https://raw.githubusercontent.com/Oreo-1/Aru/refs/heads/main/assets/gh/projectaruimg.png" class="card-img-top" alt="Project 1">
                    <div class="card-body">
                        <h5 class="card-title">Aru</h5>
                        <p class="card-text">
                            A dedicated Discord bot for my private server, one of the first projects that got me into coding.
                            Featuring lots of if-statements and cringe jokes.
                        </p>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <span class="badge bg-secondary">JavaScript</span>
                            <span class="badge bg-secondary">Node.js</span>
                        </div>
                        <div class="d-flex gap-2">
                            <!-- <a href="" class="btn btn-primary btn-sm">Learn More (soonTM)</a> -->
                            <a href="https://git.aryo.fyi/Oreo-1/Aru" target="_blank" class="btn btn-outline-secondary btn-sm">View Repository</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- project card 2 -->
            <div class="marquee-slide">
                <div class="card h-100">
                    <img src="https://raw.githubusercontent.com/HainzelK/HantuProject/refs/heads/main/gh/Talle_logo.png" class="card-img-top" alt="Project 2">
                    <div class="card-body">
                        <h5 class="card-title">Tallé</h5>
                        <p class="card-text">
                            A spell-casting augmented reality (AR) mobile game utilizing voice recognition, as a way
                            to learn and preserve the Bugis-Lontara script.
                        </p>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <span class="badge bg-secondary">Unity</span>
                            <span class="badge bg-secondary">AR Core</span>
                            <span class="badge bg-secondary">Blender</span>
                            <span class="badge badge-gold">Top 50 National (student category)</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="https://github.com/user-attachments/assets/dd2ceabe-72cd-4cad-a894-3422f0551304" target="_blank" class="btn btn-primary btn-sm">
                                📹 Watch Preview
                            </a>
                            <a href="https://github.com/HainzelK/HantuProject" target="_blank" class="btn btn-outline-secondary btn-sm">GitHub</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- project card 3 -->
            <div class="marquee-slide">
                <div class="card h-100">
                    <img src="https://raw.githubusercontent.com/Gibekkk/GarudaKotak/refs/heads/main/gh-asset/garuda_title.png" class="card-img-top" alt="Project 3">
                    <div class="card-body">
                        <h5 class="card-title">Guardian Alam Raya: Utusan Dewata Abadi</h5>
                        <p class="card-text">
                            An action-adventure game made with Construct 2, utilizing Google's Teachable Machine to capture poses for in-game actions.
                            Inspired by Indonesian mythology and folklore.
                        </p>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <span class="badge bg-secondary">Construct 2</span>
                            <span class="badge bg-secondary">Google TM</span>
                            <span class="badge bg-secondary">Computer Vision</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="https://garuda-kotak.vercel.app/" target="_blank" class="btn btn-primary btn-sm">▶︎ Play Now</a>
                            <a href="https://github.com/Gibekkk/GarudaKotak" target="_blank" class="btn btn-outline-secondary btn-sm">
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- project card 4 -->
            <div class="marquee-slide">
                <div class="card h-100">
                    <img src="https://raw.githubusercontent.com/Oreo-1/uc-kiosk/refs/heads/main/OrderHere-Frontend/assets/advs1.png" class="card-img-alternative-alternative" alt="Project 1">
                    <div class="card-body">
                        <h5 class="card-title">Order Here</h5>
                        <p class="card-text">
                            A self-serving kiosk. Features include mood-based food recommendation,
                            blockchain transaction auditing system, and admin panel for canteen staff to manage menu items.
                        </p>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <span class="badge bg-secondary">Laravel</span>
                            <span class="badge bg-secondary">IoT</span>
                            <span class="badge bg-secondary">Blockchain</span>
                        </div>
                        <div class="d-flex gap-2">
                            <!-- <a href="#" class="btn btn-primary btn-sm">Live Demo</a> -->
                            <a href="https://github.com/Oreo-1/uc-kiosk" target="_blank" class="btn btn-outline-secondary btn-sm">GitHub</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- psst add more cards here -->
{/snippet}

<!-- row 2 cards -->
{#snippet secondRow()}
            <!-- project card 1 (second row) -->
            <div class="marquee-slide">
                <div class="card h-100">
                    <img src="https://placehold.co/600x300" class="card-img-top" alt="Project 1">
                    <div class="card-body">
                        <h5 class="card-title">soon™</h5>
                        <p class="card-text">
                            upcoming platformer game project
                        </p>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <span class="badge bg-secondary">godot?</span>
                            <span class="badge bg-secondary">JavaScript?</span>
                            <span class="badge bg-secondary"></span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="/" on:click|preventDefault class="btn btn-primary btn-sm">soon™</a>
                            <a href="/" on:click|preventDefault target="_blank" class="btn btn-outline-secondary btn-sm">View Repository (soon™)</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- project card 2 (second row) -->
            <div class="marquee-slide">
                <div class="card h-100">
                    <img src="https://raw.githubusercontent.com/Oreo-1/sapatellumpanua-web/refs/heads/main/github-raws/l-min.png" class="card-img-top" alt="Project 4">
                    <div class="card-body">
                        <h5 class="card-title">Sapa Tellumpanua</h5>
                        <p class="card-text">
                            A concept website for Tellumpanua village;
                            serves as a digital presence for the village, showcasing its culture, attractions, and community initiatives.
                        </p>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <span class="badge bg-secondary">Bootstrap</span>
                            <span class="badge bg-secondary">A-Frame</span>
                            <span class="badge bg-secondary">360° View</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="https://sapatellumpanua.web.app" target="_blank" class="btn btn-primary btn-sm">Live Demo</a>
                            <a href="https://github.com/Oreo-1/sapatellumpanua-web" target="_blank" class="btn btn-outline-secondary btn-sm">GitHub</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- project card 3 (second row) -->
            <div class="marquee-slide">
                <div class="card h-100">
                    <img src="https://raw.githubusercontent.com/Oreo-1/Bebek-Kotak/refs/heads/main/assets/gh/gametitle.png" class="card-img-alternative" alt="Project 2">
                    <div class="card-body">
                        <h5 class="card-title">DuckType</h5>
                        <p class="card-text">
                            A simple typing game made with Construct 2 featuring hand made assets, local & online leaderboards, and a duck mascot.
                        </p>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <span class="badge bg-secondary">Construct 2</span>
                            <span class="badge bg-secondary">Electron</span>
                            <span class="badge badge-gold">🥇 1st Place IT Competition AMIKOM Surakarta 2025</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="https://oreo-1.github.io/Bebek-Kotak/" target="_blank" class="btn btn-primary btn-sm">▶︎ Play Now</a>
                            <a href="https://github.com/Oreo-1/Bebek-Kotak" target="_blank" class="btn btn-outline-secondary btn-sm">GitHub</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- project card 4 (second row) -->
            <div class="marquee-slide">
                <div class="card h-100">
                    <img src="https://raw.githubusercontent.com/Javinpro/ALP-Project-JAM-To-Do-List-/refs/heads/main/gh-assets/mockup-img.png" class="card-img-alternative" alt="Project 4">
                    <div class="card-body">
                        <h5 class="card-title">JAM</h5>
                        <p class="card-text">
                            A simple to-do list application made to streamline assignment process, tasks,
                            and maximize productivity with various time management methods and progress tracker.
                        </p>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <span class="badge bg-secondary">Flutter</span>
                            <span class="badge bg-secondary">Django</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="https://jam-app-web.netlify.app/" target="_blank" class="btn btn-primary btn-sm">Visit Website</a>
                            <a href="https://github.com/Javinpro/ALP-Project-JAM-To-Do-List-" target="_blank" class="btn btn-outline-secondary btn-sm">GitHub</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- psst add more cards here -->
{/snippet}

<!-- projects section -->
<section id="projects" class="py-5">
    <div class="container container-custom">
        <h1>Projects</h1>
        <p class="mb-4">Some of the projects I'm involved with.</p>
    </div>

    {@render row(firstRow)}
    {@render row(secondRow)}

    <!-- <div class="container">
        <div class="text-end">
            <a href="https://github.com/Oreo-1" target="_blank">
                <p class="mt-3 text-muted">
                    ..and some other stuffs
                </p>
            </a>

        </div>
    </div> -->

</section>

<style>
  .marquee {
    --gap: 24px;
    --per-view: 1;          /* slides visible at once */
    container-type: inline-size; /* lets slides size themselves with cqw */
    overflow: clip;
    touch-action: pan-y;    /* we handle horizontal drags, the browser keeps vertical scrolling */
  }
  @media (min-width: 768px) { .marquee { --per-view: 2; } }
  @media (min-width: 992px) { .marquee { --per-view: 3; } }

  .marquee:global(.is-dragging) { user-select: none; }

  .marquee-track { display: flex; width: max-content; }
  .marquee-group { display: flex; flex: none; }

  /* trailing margin (not `gap`) so both groups are exactly the same width */
  .marquee-slide {
    flex: none;
    width: calc((100cqw - (var(--per-view) - 1) * var(--gap)) / var(--per-view));
    margin-right: var(--gap);
  }
</style>