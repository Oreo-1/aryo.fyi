<script>
  import { skills } from '../data/skills.js';
</script>

<!-- skill card section -->
<section class="py-5 mb-4" id="skillset">
  <div class="container container-custom">
    <h1>Skills</h1>
    <p class="mb-4">What I Can Do</p>

    <div class="row g-4">
      {#each skills as skill}
        <div class="col-md-4">
          <div class="card mica-card h-100">
            <div class="card-body">
              <img src={skill.icon} class="d-block mx-auto" alt={skill.alt} />
              <h3 class="card-title mt-3">
                {skill.title[0]}
                <br class="mobile-hide" />
                {skill.title[1]}
              </h3>
              <p class="card-text">{skill.text}</p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
