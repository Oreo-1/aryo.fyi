<script>
  import { onMount } from 'svelte';

  onMount(() => {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("contact-form-status");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.classList.add("was-validated");
      status.classList.add("is-error");

      if (!form.checkValidity()) {
        status.textContent = "Please fill in every field first.";
        return;
      }

      // TODO: send it to the mail api here once it's fixed, e.g.
      // fetch("/api/contact", { method: "POST", body: new FormData(form) })
      status.textContent = "The message api is currently down, please email me directly instead.";
    });
  });
</script>

<!-- send email? -->
<section id="contact-form-section" class="container py-5 mx-auto px-3">
    <div class="row justify-content-center g-4">

        <!-- Contact form -->
        <div class="col-lg-7">
            <div class="message-panel p-4 p-md-5 h-100">
                <h2 class="mb-2">Send me a message <span class="fs-4 text-muted ms-1">*api currently broken</span></h2>
                <p class="message-subtext mb-4">
                    this'll land straight to <span class="text-decoration-underline"><a href="mailto:aryo-km@proton.me">my inbox</a></span>
                </p>
                <form id="contact-form" novalidate>
                    <div class="mb-3">
                        <label for="contact-name" class="message-field-label form-label">Name</label>
                        <input type="text" class="message-input form-control" id="contact-name" name="name"
                            placeholder="Jane Doe" required>
                    </div>
                    <div class="mb-3">
                        <label for="contact-email" class="message-field-label form-label">Email</label>
                        <input type="email" class="message-input form-control" id="contact-email" name="email"
                            placeholder="jane@email.com" required>
                    </div>
                    <div class="mb-4">
                        <label for="contact-body" class="message-field-label form-label">Message</label>
                        <textarea class="message-input form-control" id="contact-body" name="message" rows="4"
                            placeholder="What's on your mind?" required></textarea>
                    </div>
                    <div class="text-center pt-3">
                        <button type="submit" id="contact-submit-btn" class="message-send-btn btn justify-content-center">
                            <img src="/assets/mailsvg.svg" alt="" width="18" height="18" class="invert-color mb-1">
                            Send Message
                        </button>
                    </div>
                    <div id="contact-form-status" class="message-status mt-3" role="status" aria-live="polite"></div>
                </form>
            </div>
        </div>

        <!-- Other ways to contact -->
        <div class="col-lg-5 d-flex align-items-center justify-content-center" style="min-width: 0;">
            <div class="p-md-5 text-center" style="min-width: 0;">
                <h2 class="mb-2">
                    Other ways to reach me
                </h2>
                <p class="message-subtext mb-3">
                    you can also find me here
                </p>
                <div class="d-flex flex-wrap gap-3 pt-3 justify-content-center">
                    <a href="https://www.linkedin.com/in/aryo-karel-merentek/" target="_blank" class="message-contacts-btn btn">
                        <img src="/assets/icons/linkedin-icon.svg" class="contactmeimgs" alt="linkedin-icon">
                        LinkedIn
                    </a>
                    <a href="https://github.com/Oreo-1" target="_blank" rel="noopener" class="message-contacts-btn btn">
                        <img src="/assets/icons/github-icon.svg" class="contactmeimgs invert-color" alt="github-icon">
                        My Github
                    </a>
                    <a href="https://instagram.com/aryo.km" target="_blank" rel="noopener" class="message-contacts-btn btn">
                        <img src="/assets/icons/Instagram_logo_2016.svg" class="contactmeimgs" alt="instagram-icon">
                        Instagram
                    </a>
                    <a href="/" on:click|preventDefault rel="noopener" class="message-contacts-btn btn">
                        <img src="/assets/icons/discord-square-color-icon.svg" class="contactmeimgs" alt="discord-icon">
                        Discord (dot.re)
                    </a>
                    <!-- <a rel="noopener" class="message-contacts-btn btn">
                        <img src="/assets/icons/x-twitter.svg" class="contactmeimgs invert-color" alt="twitter-icon">
                        X / Twitter
                    </a> -->
                </div>
            </div>
        </div>

    </div>
</section>
