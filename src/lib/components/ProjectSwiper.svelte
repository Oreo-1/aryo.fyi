<script>
  import Swiper from 'swiper';
  import { Autoplay, FreeMode } from 'swiper/modules';

  /** @type {{ projects: Array<any> }} */
  let { projects } = $props();

  let el;

  $effect(() => {
    let resume;

    // Note: `cssEase` (from the old config) isn't a Swiper option, so it never did anything.
    // For a constant-speed marquee add `.projects-section-swiper .swiper-wrapper { transition-timing-function: linear; }`
    const swiper = new Swiper(el, {
      modules: [Autoplay, FreeMode],
      slidesPerView: 1,
      spaceBetween: 24,

      loop: true,
      speed: 15000,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      freeMode: {
        enabled: true,
        sticky: false,
      },

      on: {
        touchEnd() {
          this.autoplay.stop();
          clearTimeout(resume);
          resume = setTimeout(() => this.autoplay.start(), 2000); // resume after 2s
        },
      },

      breakpoints: {
        576: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        992: { slidesPerView: 3 },
      },
    });

    return () => {
      clearTimeout(resume);
      swiper.destroy();
    };
  });
</script>

<div class="swiper projects-section-swiper pt-3" bind:this={el}>
  <div class="swiper-wrapper">
    {#each projects as project (project.title)}
      <div class="swiper-slide">
        <div class="card h-100">
          <img src={project.image} class={project.imageClass} alt={project.title} />
          <div class="card-body">
            <h5 class="card-title">{project.title}</h5>
            <p class="card-text">{project.description}</p>

            <div class="d-flex gap-2 flex-wrap mb-3">
              {#each project.tags as tag}
                <span class="badge" class:badge-gold={tag.gold} class:bg-secondary={!tag.gold}>{tag.label}</span>
              {/each}
            </div>

            <div class="d-flex gap-2">
              {#each project.links as link}
                <a
                  href={link.href || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-sm"
                  class:btn-primary={link.primary}
                  class:btn-outline-secondary={!link.primary}
                >
                  {link.label}
                </a>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
