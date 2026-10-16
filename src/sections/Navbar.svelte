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

  onMount(() => {
    // to top of page
    document.getElementById("yuusha").addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });

    // skillset section
    document.getElementById("navSkill").addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("skillset").scrollIntoView({
        behavior: "smooth"
      });
    });

    // to projects section
    document.getElementById("navProjects").addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("projects").scrollIntoView({
        behavior: "smooth"
      });
    });

    // to contact section
    document.getElementById("navContact").addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("contactme").scrollIntoView({
        behavior: "smooth"
      });
    });
  });
</script>

<!-- navigation bar! -->
<nav
    class="navbar navbar-expand-sm navbar-dark fixed-top mica-navbar mt-4"
    class:menu-open={open}
>
    <div class="container">

        <a class="navbar-brand brandstyle" id="yuusha">
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
                    <a class="nav-link mx-1 navnavnav" id="navSkill" href="#skillset">
                        Skills
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link mx-1 navnavnav" id="navProjects" href="#projects">
                        Projects
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link mx-1 navnavnav" id="navContact" href="#contactme">
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