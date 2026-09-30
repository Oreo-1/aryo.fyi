<script>
  import { experience } from '../data/experience.js';
</script>

<!-- experience section -->
<section class="py-5 mb-5">
  <div class="container container-custom">
    <h2>Experience</h2>
    <p class="pb-3">My professional journey and roles.</p>
  </div>

  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="timeline">
          {#each experience as item}
            <div class="timeline-item">
              <div class="timeline-marker"></div>
              <div class="timeline-card">
                <div class="timeline-date">{item.date}</div>
                <div class="timeline-title">{item.title}</div>
                <div class="timeline-subtitle">{item.subtitle}</div>
                <p class="timeline-description">{item.description}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
