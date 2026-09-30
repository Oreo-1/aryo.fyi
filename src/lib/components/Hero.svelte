<script>
  import { tilt } from '../actions/tilt.js';
  import CyclingText from './CyclingText.svelte';
  import { social, cyclingTexts } from '../data/links.js';
</script>

<!-- lowkey a bit hacky -->
<section
  class="vh-100 d-flex align-items-center justify-content-center text-center"
  style="position: relative; z-index: 2;"
  id="initial-pt"
>
  <div class="container">
    <div class="row align-items-center justify-content-center text-md-start">
      <div class="col-12 col-md-6">
        <h1 class="display-2 fw-bold kewl-gradient-text">Aryo Karel M.</h1>

        <CyclingText items={cyclingTexts} />

        <p class="fs-5">
          Informatics student with interests in system administration,
          DevOps, and full-stack development.
        </p>

        <p class="fs-3 fw-bold mt-5">Find me on</p>
        <div class="d-flex justify-content-center justify-content-md-start gap-3 mt-3 social-icons-wrapper">
          <a href={social.linkedin.href} target="_blank" rel="noopener" class="social-icon">
            <img src={social.linkedin.icon} alt="linkedin-icon" />
          </a>
          <a href={social.instagram.href} target="_blank" rel="noopener" class="social-icon">
            <img src={social.instagram.icon} alt="instagram-icon" />
          </a>
          <a href={social.github.href} target="_blank" rel="noopener" class="social-icon">
            <img src={social.github.icon} class="invert-color" alt="github-icon" />
          </a>
        </div>
      </div>

      <div
        class="col-12 col-md-4 justify-content-center profile-img-wrapper tilt-card"
        use:tilt={{ max: 14, scale: 1.04, smooth: 0.12 }}
      >
        <img src="/files/wallah.png" class="rounded-profile-img mx-auto d-block" alt="me" />
      </div>
    </div>
  </div>
</section>
