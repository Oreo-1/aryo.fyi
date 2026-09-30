<script>
  import Navbar from './lib/components/Navbar.svelte';
  import VantaBackground from './lib/components/VantaBackground.svelte';
  import ThemeToggle from './lib/components/ThemeToggle.svelte';
  import Hero from './lib/components/Hero.svelte';
  import Skills from './lib/components/Skills.svelte';
  import TechStack from './lib/components/TechStack.svelte';
  import Experience from './lib/components/Experience.svelte';
  import Projects from './lib/components/Projects.svelte';
  import Contact from './lib/components/Contact.svelte';
  import Footer from './lib/components/Footer.svelte';

  let background;
</script>

<Navbar />
<VantaBackground bind:this={background} />
<ThemeToggle onswitch={(from, to) => background?.transitionColor(from, to)} />

<Hero />
<Skills />
<TechStack />
<Experience />
<Projects />
<Contact />
<Footer />
