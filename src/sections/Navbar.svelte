<script>
  import { onMount } from 'svelte';
  import 'bootstrap/js/dist/collapse'; // makes data-bs-toggle="collapse" work (mobile menu)

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

    // mobile menu: add/remove .menu-open on the navbar while the menu opens/closes
    const navbar = document.querySelector(".mica-navbar");
    const collapse = document.getElementById("navbarNav");

    collapse.addEventListener("show.bs.collapse", function () {
      navbar.classList.add("menu-open");
    });

    collapse.addEventListener("hide.bs.collapse", function () {
      navbar.classList.remove("menu-open");
    });
  });
</script>

<!-- navigation bar! -->
<nav class="navbar navbar-expand-sm navbar-dark fixed-top mica-navbar mt-4">
    <div class="container">

        <a class="navbar-brand brandstyle" id="yuusha">
            <!-- Δryo -->
            aryo.fyi
        </a>

        <!-- chevron -->
        <button 
            class="navbar-toggler ms-auto border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
        >
            <img 
                src="/assets/chevron-direction-bottom-icon.svg"
                alt="menu"
                class="toggler-icon invert-color"
            >
        </button>

        <!-- NAV CONTENT -->
        <div class="collapse navbar-collapse" id="navbarNav">
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
