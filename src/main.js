// css order: bootstrap -> swiper -> font -> app.css
import 'bootstrap/dist/css/bootstrap.min.css';
import 'swiper/css';
import './styles/fira-sans.css';
import './styles/app.css';

import { mount } from 'svelte';
import App from './App.svelte';

const app = mount(App, { target: document.getElementById('app') });

export default app;
