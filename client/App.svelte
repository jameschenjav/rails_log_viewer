<script>
  import { onMount } from 'svelte';

  import wsApi from './api/ws';
  import TopNav from './components/TopNav.svelte';
  import LogList from './components/LogList.svelte';
  import LogViewer from './components/LogViewer.svelte';

  let railsServers = {};

  let currentRid = null;

  let currentLog = null;

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
    if (currentServer) {
      selectedLogs = currentServer.logs;
    }
  }

  const loggedLogIds = new Set();

  const addLog = (log, server = currentServer) => {
    const id = log.ts;
    if (server.logs.find(({ ts }) => ts === id)) return;

    // eslint-disable-next-line no-param-reassign
    server.logs = [log, ...server.logs].slice(0, 1000);
    if (server === currentServer) selectedLogs = server.logs;
  };

  const clearLogs = (pinned) => {
    const pinnedTs = new Set(Object.keys(pinned));
    railsServers = {
      ...railsServers,
      [currentRid]: { ...currentServer, logs: selectedLogs.filter(({ ts }) => pinnedTs.has(ts)) },
    };
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

      const { path, params } = log;
      const filterText = [path, JSON.stringify(params)].join(',').toLowerCase();
      addLog({ ...log, filterText }, server);
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

  onMount(() => {
    wsApi.init();
  });
</script>

<TopNav {...{
  currentRid,
  railsServers,
  selectServer,
}} />

<main>
  <div class="columns is-variable is-1">
    <div class="column list-column is-4-widescreen is-5-tablet is-12-mobile{currentLog ? ' any' : ''}">
      <LogList bind:selectedLog={currentLog} {...{
        currentRid,
        railsServers,
        clearLogs,
        logs: selectedLogs,
        addLogBack: addLog,
      }} />
    </div>

    <div class="column is-relative viewer-column">
      <LogViewer log={currentLog} server={currentServer} />
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
  max-width: 500px
}
</style>
