<script>
  import { social } from '../data/links.js';

  let form;
  let wasValidated = $state(false);
  let status = $state({ kind: '', text: '' }); // kind: '' | 'success' | 'error'

  function submit(e) {
    e.preventDefault();
    wasValidated = true;

    if (!form.checkValidity()) {
      status = { kind: 'error', text: 'Please fill in every field first.' };
      return;
    }

    // TODO: wire this up once the mail api is fixed.
    // const data = Object.fromEntries(new FormData(form));
    // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data), ... });
    status = { kind: 'error', text: 'The message api is currently down, please email me directly instead.' };
  }
</script>

<!-- contact me! -->
<section
  class="pt-5 mt-5 mb-3 d-flex flex-column align-items-center justify-content-center text-center"
  id="contactme"
>
  <div class="container container-custom">
    <h1 class="fw-bold">Contacts</h1>
    <h4 class="text-muted">always interested in making something cool</h4>
  </div>
</section>

<!-- send email? -->
<section id="contact-form-section" class="container py-5 mx-auto px-3">
  <div class="row justify-content-center g-4">
    <!-- Contact form -->
    <div class="col-lg-7">
      <div class="message-panel p-4 p-md-5 h-100">
        <h2 class="mb-2">Send me a message <span class="fs-4 text-muted ms-1">*api currently broken</span></h2>
        <p class="message-subtext mb-4">
          this'll land straight to
          <span class="text-decoration-underline"><a href="mailto:aryo-km@proton.me">my inbox</a></span>
        </p>

        <form bind:this={form} class:was-validated={wasValidated} onsubmit={submit} novalidate>
          <div class="mb-3">
            <label for="contact-name" class="message-field-label form-label">Name</label>
            <input type="text" class="message-input form-control" id="contact-name" name="name" placeholder="Jane Doe" required />
          </div>
          <div class="mb-3">
            <label for="contact-email" class="message-field-label form-label">Email</label>
            <input type="email" class="message-input form-control" id="contact-email" name="email" placeholder="jane@email.com" required />
          </div>
          <div class="mb-4">
            <label for="contact-body" class="message-field-label form-label">Message</label>
            <textarea class="message-input form-control" id="contact-body" name="message" rows="4" placeholder="What's on your mind?" required></textarea>
          </div>
          <div class="text-center pt-3">
            <button type="submit" class="message-send-btn btn justify-content-center">
              <img src="/assets/mailsvg.svg" alt="" width="18" height="18" class="invert-color mb-1" />
              Send Message
            </button>
          </div>
          <div
            class="message-status mt-3"
            class:is-success={status.kind === 'success'}
            class:is-error={status.kind === 'error'}
            role="status"
            aria-live="polite"
          >
            {status.text}
          </div>
        </form>
      </div>
    </div>

    <!-- Other ways to contact -->
    <div class="col-lg-5 d-flex align-items-center justify-content-center" style="min-width: 0;">
      <div class="p-md-5 text-center" style="min-width: 0;">
        <h2 class="mb-2">Other ways to reach me</h2>
        <p class="message-subtext mb-3">you can also find me here</p>
        <div class="d-flex flex-wrap gap-3 pt-3 justify-content-center">
          <a href={social.linkedin.href} target="_blank" rel="noopener" class="message-contacts-btn btn">
            <img src={social.linkedin.icon} class="contactmeimgs" alt="linkedin-icon" />
            {social.linkedin.label}
          </a>
          <a href={social.github.href} target="_blank" rel="noopener" class="message-contacts-btn btn">
            <img src={social.github.icon} class="contactmeimgs invert-color" alt="github-icon" />
            {social.github.label}
          </a>
          <a href={social.instagram.href} target="_blank" rel="noopener" class="message-contacts-btn btn">
            <img src={social.instagram.icon} class="contactmeimgs" alt="instagram-icon" />
            {social.instagram.label}
          </a>
          <a rel="noopener" class="message-contacts-btn btn" aria-disabled="true">
            <img src="/assets/icons/discord-square-color-icon.svg" class="contactmeimgs" alt="discord-icon" />
            Discord (dot.re)
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
