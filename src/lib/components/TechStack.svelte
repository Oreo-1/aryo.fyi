<script>
  import { techRows } from '../data/tech.js';
</script>

<!-- tools and tech stack section -->
<section class="py-5">
  <div class="container container-custom">
    <h2>Tools &amp; Technologies</h2>
    <p class="mb-4">Tech stacks I primarily work with</p>

    {#each techRows as row}
      <div class="row g-5 mb-5">
        {#each row as group}
          <div class={group.wrap}>
            <h5 class="category-title">{group.title}</h5>
            <hr class="border-1 opacity-25" />

            <div class="row g-3">
              {#each group.items as tech}
                <div class={group.item}>
                  <div class="tech-card">
                    <img src={tech.icon} alt={tech.alt ?? tech.name} />
                    <div class="tech-name">{tech.name}</div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</section>
