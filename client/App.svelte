<script>
  import { onMount } from 'svelte';

  import wsApi from './api/ws';
  import TopNav from './components/TopNav.svelte';
  import LogList from './components/LogList.svelte';
  import LogViewer from './components/LogViewer.svelte';

  let railsServers = {};

  let currentRid = null;

  let currentLog = null;

  let largeScreen = false;

  $: wideList = largeScreen || !currentLog;

  const selectServer = (rid) => {
    if (currentRid === rid) return;

    if (rid) {
      currentRid = rid;
    } else {
      currentRid = null;
    }
  };

  const autoSelectServer = (server) => {
    if (currentRid || !server) return;

    selectServer(server.pid);
  };

  $: currentServer = railsServers[currentRid];

  let selectedLogs = [];

  $: {
    selectedLogs = currentServer ? currentServer.logs : [];
  }

  const loggedLogIds = new Set();

  const addLog = (log, server = currentServer) => {
    const id = log.ts;
    if (server.logs.find(({ ts }) => ts === id)) return;

    // eslint-disable-next-line no-param-reassign
    server.logs = [log, ...server.logs].slice(0, 1000);
    if (server === currentServer) selectedLogs = server.logs;
  };

  wsApi.handlers = {
    data(log) {
      const { rid } = log;
      const server = railsServers[rid];
      if (!server) return;

      const id = `${rid}-${log.ts}`;
      if (loggedLogIds.has(id)) return;

      loggedLogIds.add(id);
      const t = setTimeout(() => {
        clearTimeout(t);
        loggedLogIds.delete(id);
      }, 1000);
      addLog(log, server);
    },

    init({ servers }) {
      const srvs = {};
      servers.forEach((server) => {
        srvs[server.pid] = { logs: [], ...server };
      });
      railsServers = srvs;

      autoSelectServer(servers[0]);
    },

    connected({ server }) {
      railsServers = {
        ...railsServers,
        [server.pid]: { logs: [], ...server },
      };
      autoSelectServer(server);
    },

    closed({ rid }) {
      const { [rid]: _, ...srvs } = railsServers;
      railsServers = srvs;
      if (currentRid && !(currentRid in railsServers)) {
        currentRid = null;
      }
    },
  };

  wsApi.onDisconnect = () => {
    railsServers = {};
    currentRid = null;
  };

  const updateScreenSize = () => {
    const w = window.innerWidth;
    largeScreen = w > 1600;
  };

  onMount(() => {
    wsApi.init();
    window.addEventListener('resize', updateScreenSize);
    updateScreenSize();
  });
</script>

<TopNav {...{
  currentRid,
  railsServers,
  selectServer,
}} />

<main>
  <div class="columns is-variable is-1">
    <div class="column list-column is-4-widescreen is-5-tablet is-12-mobile {wideList ? '' : 'minimal'}">
      <LogList bind:selectedLog={currentLog} {...{
        currentRid,
        railsServers,
        logs: selectedLogs,
        addLogBack: addLog,
        small: !wideList,
      }} />
    </div>

    <div class="column is-relative viewer-column">
      <LogViewer log={currentLog} />
    </div>
  </div>
</main>

<style>
main {
  display: flex;
  padding: 8px;
  flex: 1;
  overflow: hidden;
}

.container.is-fluid {
  display: flex;
}

.columns {
  flex: 1;
}

.column {
  justify-content: stretch;
  overflow: hidden;
}

.column.list-column {
  display: flex;
}

.column.list-column.minimal {
  width: 250px;
}
</style>
