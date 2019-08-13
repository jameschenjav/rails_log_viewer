<script>
  export let railsServers = {};
  export let currentRid = null;
  export let selectServer = () => {};

  let active = false;

  $: serverList = Object.keys(railsServers).sort();

  const formatServer = (rid) => {
    const { path, port } = railsServers[rid];
    return `${path}:${port} (#${rid})`;
  };

  const onSelectServer = (rid) => {
    active = false;
    selectServer(rid);
  };

  window.addEventListener('mouseup', () => {
    if (!window.document.querySelector('.navbar-link.select-server:focus')) {
      active = false;
    }
  });
</script>

<nav class="navbar has-shadow">
  <div class="container is-fluid">
    <div class="navbar-item has-dropdown {active ? 'is-active' : ''}">
      <a href
        class="navbar-link select-server"
        on:click|preventDefault={() => { active = !active; }}
      >
        {currentRid ? `Server: ${formatServer(currentRid)}` : 'Select Server'}
      </a>

      <div class="navbar-dropdown">
        {#each serverList as rid (rid)}
          <a href
            class="navbar-item {rid === currentRid ? 'is-active' : ''}"
            on:click|preventDefault|stopPropagation={() => onSelectServer(rid)}
          >
            {formatServer(rid)}
          </a>
        {/each}
      </div>
    </div>

    <div class="navbar-end navbar-item">Rails Log Viewer</div>
  </div>
</nav>
