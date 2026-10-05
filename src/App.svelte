<script>
  // the page, top to bottom. one file per <section> in src/sections.
  // reorder / remove / add lines to change the page.
  import Navbar from './sections/Navbar.svelte';
  import Background from './sections/Background.svelte';

  import Hero from './sections/Hero.svelte';
  import Skills from './sections/Skills.svelte';
  import TechStack from './sections/TechStack.svelte';
  import Experience from './sections/Experience.svelte';
  import Projects from './sections/Projects.svelte';
  import ContactHeader from './sections/ContactHeader.svelte';
  import ContactForm from './sections/ContactForm.svelte';
  import Footer from './sections/Footer.svelte';
</script>

<Navbar />
<Background />

<Hero />
<Skills />
<TechStack />
<Experience />
<Projects />
<ContactHeader />
<ContactForm />
<Footer />
