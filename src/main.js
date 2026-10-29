// css order: bootstrap -> additional js -> fonts -> app.css

// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

// fonts
// import './styles/fonts.css';

// styles
import './styles/app.css';
import './styles/hero.css';
import './styles/leftbar.css'

import { mount } from 'svelte';
import App from './App.svelte';

const app = mount(App, { target: document.getElementById('app') });

export default app;
