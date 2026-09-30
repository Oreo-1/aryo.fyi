<script>
  // only bootstrap's collapse module (no popper, no rest of the bundle),
  // it gives us the same height animation as before
  import Collapse from 'bootstrap/js/dist/collapse';
  import { scrollToTop, scrollToId } from '../scroll.js';

  let open = $state(false);
  let menu;
  let collapse;

  $effect(() => {
    collapse = new Collapse(menu, { toggle: false });

    // same events the old main.js listened to, drives .menu-open on the navbar
    const onShow = () => (open = true);
    const onHide = () => (open = false);
    menu.addEventListener('show.bs.collapse', onShow);
    menu.addEventListener('hide.bs.collapse', onHide);

    return () => {
      menu.removeEventListener('show.bs.collapse', onShow);
      menu.removeEventListener('hide.bs.collapse', onHide);
      collapse.dispose();
    };
  });

  // [label, id of the section to scroll to]
  const links = [
    ['Skills', 'skillset'],
    ['Projects', 'projects'],
    ['Contact', 'contactme'],
  ];

  function go(e, id) {
    e.preventDefault();
    scrollToId(id);
  }
</script>

<nav class="navbar navbar-expand-sm navbar-dark fixed-top mica-navbar mt-4" class:menu-open={open}>
  <div class="container">
    <a
      class="navbar-brand brandstyle"
      href="#initial-pt"
      onclick={(e) => {
        e.preventDefault();
        scrollToTop();
      }}
    >
      aryo.fyi
    </a>

    <!-- chevron -->
    <button
      class="navbar-toggler ms-auto border-0 shadow-none"
      type="button"
      aria-controls="navbarNav"
      aria-expanded={open}
      aria-label="Toggle navigation"
      onclick={() => collapse?.toggle()}
    >
      <img src="/assets/chevron-direction-bottom-icon.svg" alt="menu" class="toggler-icon invert-color" />
    </button>

    <!-- NAV CONTENT -->
    <div class="collapse navbar-collapse" id="navbarNav" bind:this={menu}>
      <ul class="navbar-nav mx-auto align-items-sm-center">
        {#each links as [label, id]}
          <li class="nav-item">
            <a class="nav-link mx-1 navnavnav" href={`#${id}`} onclick={(e) => go(e, id)}>
              {label}
            </a>
          </li>
        {/each}
        <li class="nav-item">
          <a href="/files/Curriculum-Vitae.pdf" target="_blank" rel="noopener" class="btn btn-light btn-sm cv-btn brandstyle">
            View CV
          </a>
        </li>
      </ul>
    </div>
  </div>
</nav>
