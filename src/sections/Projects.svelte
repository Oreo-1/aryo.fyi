<script>
  import { onMount } from 'svelte';
  import Swiper from 'swiper';
  import { Autoplay, FreeMode } from 'swiper/modules';

  onMount(() => {
    let resumeTimer;
    const swipers = [];

    // one swiper per .projects-section-swiper row
    document.querySelectorAll('.projects-section-swiper').forEach((row) => {
      swipers.push(
        new Swiper(row, {
          modules: [Autoplay, FreeMode],
          slidesPerView: 1,
          spaceBetween: 24,

          loop: true,
          speed: 15000,
          // (cssEase isn't a swiper option, for a constant speed marquee use
          //  .projects-section-swiper .swiper-wrapper { transition-timing-function: linear; } in app.css)
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
              clearTimeout(resumeTimer);
              resumeTimer = setTimeout(() => this.autoplay.start(), 2000); // resume after 2s
            },
          },

          breakpoints: {
            576: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
          },
        })
      );
    });

    return () => {
      clearTimeout(resumeTimer);
      swipers.forEach((s) => s.destroy());
    };
  });
</script>

<!-- projects section -->
<section id="projects" class="py-5">
    <div class="container container-custom">
        <h1>Projects</h1>
        <p class="mb-4">Some of the projects I'm involved with.</p>
    </div>

    <div class="swiper projects-section-swiper pt-3">
        <div class="swiper-wrapper">

            <!-- project card 1 -->
            <div class="swiper-slide">
                <div class="card h-100">
                    <img src="https://raw.githubusercontent.com/Oreo-1/Aru/refs/heads/main/assets/gh/projectaruimg.png" class="card-img-top" alt="Project 1">
                    <div class="card-body">
                        <h5 class="card-title">Aru</h5>
                        <p class="card-text">
                            A dedicated Discord bot for my private server, one of the first projects that got me into coding.
                            Featuring lots of if-statements and cringe jokes.
                        </p>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <span class="badge bg-secondary">JavaScript</span>
                            <span class="badge bg-secondary">Node.js</span>
                        </div>
                        <div class="d-flex gap-2">
                            <!-- <a href="" class="btn btn-primary btn-sm">Learn More (soonTM)</a> -->
                            <a href="https://git.aryo.fyi/Oreo-1/Aru" target="_blank" class="btn btn-outline-secondary btn-sm">View Repository</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- project card 2 -->
            <div class="swiper-slide">
                <div class="card h-100">
                    <img src="https://raw.githubusercontent.com/HainzelK/HantuProject/refs/heads/main/gh/Talle_logo.png" class="card-img-top" alt="Project 2">
                    <div class="card-body">
                        <h5 class="card-title">Tallé</h5>
                        <p class="card-text">
                            A spell-casting augmented reality (AR) mobile game utilizing voice recognition, as a way
                            to learn and preserve the Bugis-Lontara script.
                        </p>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <span class="badge bg-secondary">Unity</span>
                            <span class="badge bg-secondary">AR Core</span>
                            <span class="badge bg-secondary">Blender</span>
                            <span class="badge badge-gold">Top 50 National (student category)</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="https://github.com/user-attachments/assets/dd2ceabe-72cd-4cad-a894-3422f0551304" target="_blank" class="btn btn-primary btn-sm">
                                📹 Watch Preview
                            </a>
                            <a href="https://github.com/HainzelK/HantuProject" target="_blank" class="btn btn-outline-secondary btn-sm">GitHub</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- project card 3 -->
            <div class="swiper-slide">
                <div class="card h-100">
                    <img src="https://raw.githubusercontent.com/Gibekkk/GarudaKotak/refs/heads/main/gh-asset/garuda_title.png" class="card-img-top" alt="Project 3">
                    <div class="card-body">
                        <h5 class="card-title">Guardian Alam Raya: Utusan Dewata Abadi</h5>
                        <p class="card-text">
                            An action-adventure game made with Construct 2, utilizing Google's Teachable Machine to capture poses for in-game actions.
                            Inspired by Indonesian mythology and folklore.
                        </p>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <span class="badge bg-secondary">Construct 2</span>
                            <span class="badge bg-secondary">Google TM</span>
                            <span class="badge bg-secondary">Computer Vision</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="https://garuda-kotak.vercel.app/" target="_blank" class="btn btn-primary btn-sm">▶︎ Play Now</a>
                            <a href="https://github.com/Gibekkk/GarudaKotak" target="_blank" class="btn btn-outline-secondary btn-sm">
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- project card 4 -->
            <div class="swiper-slide">
                <div class="card h-100">
                    <img src="https://raw.githubusercontent.com/Oreo-1/uc-kiosk/refs/heads/main/OrderHere-Frontend/assets/advs1.png" class="card-img-alternative-alternative" alt="Project 1">
                    <div class="card-body">
                        <h5 class="card-title">Order Here</h5>
                        <p class="card-text">
                            A self-serving kiosk. Features include mood-based food recommendation,
                            blockchain transaction auditing system, and admin panel for canteen staff to manage menu items.
                        </p>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <span class="badge bg-secondary">Laravel</span>
                            <span class="badge bg-secondary">IoT</span>
                            <span class="badge bg-secondary">Blockchain</span>
                        </div>
                        <div class="d-flex gap-2">
                            <!-- <a href="#" class="btn btn-primary btn-sm">Live Demo</a> -->
                            <a href="https://github.com/Oreo-1/uc-kiosk" target="_blank" class="btn btn-outline-secondary btn-sm">GitHub</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- psst add more cards here -->

        </div>

        <!-- Navigation & Pagination -->
    </div>

    <!-- <div class="swiper-pagination mt-3"></div> -->

    <div class="swiper projects-section-swiper pt-3">
        <div class="swiper-wrapper">

            <!-- project card 1 (second row) -->
            <div class="swiper-slide">
                <div class="card h-100">
                    <img src="https://placehold.co/600x300" class="card-img-top" alt="Project 1">
                    <div class="card-body">
                        <h5 class="card-title">soon™</h5>
                        <p class="card-text">
                            upcoming platformer game project
                        </p>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <span class="badge bg-secondary">godot?</span>
                            <span class="badge bg-secondary">JavaScript?</span>
                            <span class="badge bg-secondary"></span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="/" on:click|preventDefault class="btn btn-primary btn-sm">soon™</a>
                            <a href="/" on:click|preventDefault target="_blank" class="btn btn-outline-secondary btn-sm">View Repository (soon™)</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- project card 2 (second row) -->
            <div class="swiper-slide">
                <div class="card h-100">
                    <img src="https://raw.githubusercontent.com/Oreo-1/sapatellumpanua-web/refs/heads/main/github-raws/l-min.png" class="card-img-top" alt="Project 4">
                    <div class="card-body">
                        <h5 class="card-title">Sapa Tellumpanua</h5>
                        <p class="card-text">
                            A concept website for Tellumpanua village;
                            serves as a digital presence for the village, showcasing its culture, attractions, and community initiatives.
                        </p>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <span class="badge bg-secondary">Bootstrap</span>
                            <span class="badge bg-secondary">A-Frame</span>
                            <span class="badge bg-secondary">360° View</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="https://sapatellumpanua.web.app" target="_blank" class="btn btn-primary btn-sm">Live Demo</a>
                            <a href="https://github.com/Oreo-1/sapatellumpanua-web" target="_blank" class="btn btn-outline-secondary btn-sm">GitHub</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- project card 3 (second row) -->
            <div class="swiper-slide">
                <div class="card h-100">
                    <img src="https://raw.githubusercontent.com/Oreo-1/Bebek-Kotak/refs/heads/main/assets/gh/gametitle.png" class="card-img-alternative" alt="Project 2">
                    <div class="card-body">
                        <h5 class="card-title">DuckType</h5>
                        <p class="card-text">
                            A simple typing game made with Construct 2 featuring hand made assets, local & online leaderboards, and a duck mascot.
                        </p>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <span class="badge bg-secondary">Construct 2</span>
                            <span class="badge bg-secondary">Electron</span>
                            <span class="badge badge-gold">🥇 1st Place IT Competition AMIKOM Surakarta 2025</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="https://oreo-1.github.io/Bebek-Kotak/" target="_blank" class="btn btn-primary btn-sm">▶︎ Play Now</a>
                            <a href="https://github.com/Oreo-1/Bebek-Kotak" target="_blank" class="btn btn-outline-secondary btn-sm">GitHub</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- project card 4 (second row) -->
            <div class="swiper-slide">
                <div class="card h-100">
                    <img src="https://raw.githubusercontent.com/Javinpro/ALP-Project-JAM-To-Do-List-/refs/heads/main/gh-assets/mockup-img.png" class="card-img-alternative" alt="Project 4">
                    <div class="card-body">
                        <h5 class="card-title">JAM</h5>
                        <p class="card-text">
                            A simple to-do list application made to streamline assignment process, tasks,
                            and maximize productivity with various time management methods and progress tracker.
                        </p>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <span class="badge bg-secondary">Flutter</span>
                            <span class="badge bg-secondary">Django</span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="https://jam-app-web.netlify.app/" target="_blank" class="btn btn-primary btn-sm">Visit Website</a>
                            <a href="https://github.com/Javinpro/ALP-Project-JAM-To-Do-List-" target="_blank" class="btn btn-outline-secondary btn-sm">GitHub</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- psst add more cards here -->

        </div>

        <!-- Navigation & Pagination -->
    </div>

    <!-- <div class="container">
        <div class="text-end">
            <a href="https://github.com/Oreo-1" target="_blank">
                <p class="mt-3 text-muted">
                    ..and some other stuffs
                </p>
            </a>

        </div>
    </div> -->

</section>
