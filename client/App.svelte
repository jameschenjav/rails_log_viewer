<script>
  import wsApi from './wsApi';
  import TopNav from './TopNav.svelte';
  import LogList from './LogList.svelte';

  let railsServers = {};

  let currentRid = null;

  const selectServer = (rid) => {
    if (currentRid === rid) return;

    if (rid) {
      currentRid = rid;
    } else {
      currentRid = null;
    }
  };

  $: currentServer = railsServers[currentRid];

  let selectedLogs = [];

  $: {
    selectedLogs = currentServer ? currentServer.logs : [];
  }

  wsApi.handlers = {
    data({ rid, ...log }) {
      const server = railsServers[rid];
      if (!server) return;

      server.logs = [log, ...server.logs].slice(0, 1000);
      if (server === currentServer) selectedLogs = server.logs;
    },

    init({ servers }) {
      const srvs = {};
      servers.forEach((server) => {
        srvs[server.pid] = { logs: [], ...server };
      });
      railsServers = srvs;
    },

    connected({ server }) {
      railsServers = {
        ...railsServers,
        [server.pid]: { logs: [], ...server },
      };
    },

    closed({ rid }) {
      const { [rid]: _, ...srvs } = railsServers;
      railsServers = srvs;
    },
  };
</script>

<TopNav {...{
  currentRid,
  railsServers,
  selectServer,
}} />

<main class="main">
  <div class="container is-fluid">
    <div class="columns is-mobile">
      <LogList logs={selectedLogs} />
      <div class="column"></div>
    </div>
  </div>
</main>
