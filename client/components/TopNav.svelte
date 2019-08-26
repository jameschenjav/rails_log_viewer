<script>
  import Settings from './Settings.svelte';
  import Icon from './Icon.svelte';

  export let railsServers = {};
  export let currentRid = null;
  export let selectServer = () => {};

  let active = false;

  let settingsOpen = false;

  $: serverList = Object.keys(railsServers).sort();

  const formatServer = (rid) => {
    const { path, port } = railsServers[rid];
    return `${path}:${port} (#${rid})`;
  };

  const onSelectServer = (rid) => {
    active = false;
    selectServer(rid);
  };

  const openSettings = () => {
    settingsOpen = true;
  };

  const closeSettings = () => {
    settingsOpen = false;
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

    <div class="modal {settingsOpen ? 'is-active' : ''}">
      <div class="modal-background" on:click={closeSettings}></div>
      <div class="modal-content">
        <div class="message is-info">
          <section class="message-header">
            Settings
            <button class="delete" on:click={closeSettings}></button>
          </section>
          <section class="message-body">
            {#if settingsOpen}
              <Settings />
            {/if}
          </section>
        </div>
      </div>
    </div>

    <div class="navbar-end">
      <div class="navbar-item">
        <a class="button is-info is-outlined" href on:click|preventDefault={openSettings}>
          <span class="icon"><Icon name="settings" /></span>
          <span>Settings</span>
        </a>
      </div>

      <div class="navbar-item">Rails Log Viewer</div>
    </div>
  </div>
</nav>
