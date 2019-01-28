import Vue from 'vue';
import App from './App';
import store from './store';
import startWsApi from './wsApi';

Vue.config.productionTip = false;

startWsApi({ store, url: `ws://${window.location.host}/log` });
new Vue({
  store,
  render: h => h(App),
}).$mount('#app');
