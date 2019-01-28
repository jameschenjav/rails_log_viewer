import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    servers: {},
    rid: null,
    logs: [],
  },
  getters: {
    serverList: ({ servers }) => Object.values(servers),
    current: ({ servers, rid }) => rid && servers[rid],
  },
  mutations: {
    updateStateSync: (state, payload) => {
      Object.keys(payload).forEach(key => Vue.set(state, key, payload[key]));
    },
    addServer: ({ servers }, { server }) => Vue.set(servers, server.pid, server),
    deleteServer: ({ servers }, { rid }) => delete servers[rid],
    selectServer: (state, rid) => {
      const server = state.servers[rid];
      if (server) {
        state.rid = rid;
        state.logs = [];
      }
    },
    addLogSync: ({ logs }, log) => logs.push(log),
  },
  actions: {
    updateState: ({ commit }, payload) => {
      commit('updateStateSync', payload);
    },
    commitUpdate: ({ commit }, { name, ...payload }) => {
      commit(name, payload);
    },
    addLog: ({ commit, getters: { current } }, rid, log) => {
      if (current.pid === rid) commit('addLogSync', log);
    },
  },
});
