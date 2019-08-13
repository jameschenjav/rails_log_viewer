import App from './App.svelte';

import './vendor.sass';
import './app.sass';

const app = new App({ target: document.body });

window.app = app;

export default app;
