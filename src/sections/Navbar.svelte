<script>
  import { onMount } from 'svelte';

  // ---- mobile menu (replaces bootstrap/js/dist/collapse) ----
  let open = false;          // drives aria-expanded + .menu-open on the navbar
  let transitioning = false; // ignore clicks while the height animation runs
  let menuEl;                // #navbarNav

  function finish() {
    menuEl.classList.remove('collapsing');
    menuEl.classList.add('collapse');
    if (open) menuEl.classList.add('show');
    menuEl.style.height = '';
    transitioning = false;
  }

  function toggleMenu() {
    if (transitioning) return;
    transitioning = true;
    open = !open;

    if (open) {
      // expand: 0 -> content height
      menuEl.classList.remove('collapse');
      menuEl.classList.add('collapsing');
      menuEl.style.height = '0px';
      menuEl.style.height = menuEl.scrollHeight + 'px'; // reading scrollHeight forces the reflow
    } else {
      // collapse: current height -> 0
      menuEl.style.height = menuEl.getBoundingClientRect().height + 'px';
      menuEl.offsetHeight; // force reflow so the transition starts from the current height
      menuEl.classList.add('collapsing');
      menuEl.classList.remove('collapse', 'show');
      menuEl.style.height = '';
    }

    // if transitions are disabled (e.g. reduced-motion overrides), transitionend never fires
    if (parseFloat(getComputedStyle(menuEl).transitionDuration) === 0) finish();
  }

  function onTransitionEnd(e) {
    if (e.target === menuEl && e.propertyName === 'height') finish();
  }

  // ---- scrollspy (replaces bootstrap/js/dist/scrollspy) ----
  // keep these in the same order as they appear on the page
  const SECTION_IDS = ['skillset', 'projects', 'contactme'];

  // a section becomes "active" once its top passes this line (px from viewport top).
  // must be >= your html scroll-padding-top (80px), so a clicked section
  // lands just past the line and is counted as active
  const SPY_OFFSET = 100;

  let activeId = null; // null = above the first section (e.g. the hero)

  function updateActive() {
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    let current = null;

    if (atBottom) {
      // a short last section may never reach the line, so force it at the bottom
      current = SECTION_IDS[SECTION_IDS.length - 1];
    } else {
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= SPY_OFFSET) current = id;
      }
    }

    activeId = current;
  }

  // ---- click lock ----
  // while a click-initiated smooth scroll is running, the spy is "locked":
  // the clicked link stays active and scroll events don't change it.
  // manual scrolling (no lock) behaves like a normal scrollspy.
  let locked = false;
  let unlockTimer;

  function armUnlock() {
    clearTimeout(unlockTimer);
    // no scroll event for 150ms = the smooth scroll finished (or never started)
    unlockTimer = setTimeout(releaseLock, 150);
  }

  function lockSpy() {
    locked = true;
    armUnlock();
  }

  function releaseLock() {
    clearTimeout(unlockTimer);
    locked = false;
    updateActive(); // hand control back to the normal scrollspy
  }

  // user grabs the scroll mid-animation: stop locking immediately
  function cancelLock() {
    if (locked) releaseLock();
  }

  function scrollToSection(id) {
    activeId = id; // underline jumps straight to the clicked link
    lockSpy();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  function scrollToTop() {
    activeId = null; // brand = back to the top, no section underlined
    lockSpy();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onMount(() => {
    // throttle to one update per frame
    let ticking = false;
    const onScroll = () => {
      if (locked) {
        armUnlock(); // still animating: keep waiting, don't touch activeId
        return;
      }
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // any manual input cancels the click lock so the user stays in control
    window.addEventListener('wheel', cancelLock, { passive: true });
    window.addEventListener('touchstart', cancelLock, { passive: true });
    window.addEventListener('keydown', cancelLock);
    updateActive(); // set the initial state (e.g. page loaded mid-scroll)

    return () => {
      clearTimeout(unlockTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', cancelLock);
      window.removeEventListener('touchstart', cancelLock);
      window.removeEventListener('keydown', cancelLock);
    };
  });
</script>

<!-- navigation bar! -->
<nav
    class="navbar navbar-expand-sm navbar-dark fixed-top mica-navbar mt-4"
    class:menu-open={open}
>
    <div class="container">

        <a class="navbar-brand brandstyle" id="yuusha" href="#navbar-area" on:click|preventDefault={scrollToTop}>
            <!-- Δryo -->
            aryo.fyi
        </a>

        <!-- chevron -->
        <button 
            class="navbar-toggler ms-auto border-0 shadow-none"
            type="button"
            on:click={toggleMenu}
            aria-controls="navbarNav"
            aria-expanded={open}
            aria-label="Toggle navigation"
        >
            <img 
                src="/assets/chevron-direction-bottom-icon.svg"
                alt="menu"
                class="toggler-icon invert-color"
            >
        </button>

        <!-- NAV CONTENT -->
        <div
            class="collapse navbar-collapse"
            id="navbarNav"
            bind:this={menuEl}
            on:transitionend={onTransitionEnd}
        >
            <ul class="navbar-nav mx-auto align-items-sm-center">

                <li class="nav-item">
                    <a
                        class="nav-link mx-1 navnavnav"
                        class:active={activeId === 'skillset'}
                        aria-current={activeId === 'skillset' ? 'true' : undefined}
                        id="navSkill"
                        href="#skillset"
                        on:click|preventDefault={() => scrollToSection('skillset')}
                    >
                        Skills
                    </a>
                </li>
                <li class="nav-item">
                    <a
                        class="nav-link mx-1 navnavnav"
                        class:active={activeId === 'projects'}
                        aria-current={activeId === 'projects' ? 'true' : undefined}
                        id="navProjects"
                        href="#projects"
                        on:click|preventDefault={() => scrollToSection('projects')}
                    >
                        Projects
                    </a>
                </li>
                <li class="nav-item">
                    <a
                        class="nav-link mx-1 navnavnav"
                        class:active={activeId === 'contactme'}
                        aria-current={activeId === 'contactme' ? 'true' : undefined}
                        id="navContact"
                        href="#contactme"
                        on:click|preventDefault={() => scrollToSection('contactme')}
                    >
                        Contact
                    </a>
                </li>
                <li class="nav-item">
                    <a href="/files/Curriculum-Vitae.pdf" target="_blank" class="btn btn-light btn-sm cv-btn brandstyle">
                        View CV
                    </a>
                </li>

            </ul>
        </div>

    </div>
</nav>