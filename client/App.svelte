<script>
  import wsApi from './wsApi';
  import TopNav from './TopNav.svelte';

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
      <div class="column is-4-widescreen is-4-desktop is-12-mobile logs">
        <nav class="panel">
          <p class="panel-heading">Logs</p>
          <div class="panel-block">
            <p class="control has-icons-left">
              <input class="input" type="text" placeholder="search">
              <span class="icon is-left">
                <i class="mdi mdi-magnify" aria-hidden="true"></i>
              </span>
            </p>
          </div>

          {#each selectedLogs as log (log.ts)}
            <a href
              class="panel-block is-size-7"
              on:click|preventDefault={() => {}}
            >
              {log.path}
            </a>
          {/each}
        </nav>
      </div>
      <div class="column"></div>
    </div>
  </div>
</main>
