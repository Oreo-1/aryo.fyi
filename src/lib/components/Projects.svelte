<script>
  import ProjectSwiper from './ProjectSwiper.svelte';
  import { projectRows } from '../data/projects.js';
</script>

<!-- projects section -->
<section id="projects" class="py-5">
  <div class="container container-custom">
    <h1>Projects</h1>
    <p class="mb-4">Some of the projects I'm involved with.</p>
  </div>

  {#each projectRows as row}
    <ProjectSwiper projects={row} />
  {/each}
</section>
