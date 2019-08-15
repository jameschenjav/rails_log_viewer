import App from './App.svelte';

import './styles/vendor.sass';
import './styles/app.sass';
import './assets/FiraCode-Regular.woff2';

const app = new App({ target: document.body });

window.app = app;

export default app;
