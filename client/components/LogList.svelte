<script>
  import ListItem from './list/ListItem.svelte';
  import ListFilter from './list/ListFilter.svelte';

  export let currentRid = null;
  export let railsServers = {};
  export let logs = [];
  export let selectedLog = null;
  export let addLogBack = () => {};

  let pinned = {};

  $: currentPinned = pinned[currentRid] || {};

  $: allLogs = [
    ...Object.values(currentPinned),
    ...logs.filter(({ ts }) => !currentPinned[ts]),
  ].sort(({ ts: s1 }, { ts: s2 }) => (s1 < s2 ? +1 : -1));

  $: {
    const newPinned = {};
    Object.keys(railsServers).forEach((rid) => {
      newPinned[rid] = pinned[rid] || {};
    });
  }

  const uniq = (items) => [...(new Set(items))].sort();

  $: allMethods = uniq(allLogs.map(({ method }) => (method ? method.toUpperCase() : '')));

  $: allFormats = uniq(allLogs.map(({ format }) => format));

  $: allStatuses = uniq(allLogs.map(({ status }) => `${status}`[0])).map((v) => [v, `${v}xx`]);

  let methodFilter = '';

  let formatFilter = '';

  let statusFilter = '';

  let filteredLogs = [];

  $: {
    let items = allLogs;
    if (methodFilter) {
      items = items.filter(({ method }) => method === methodFilter);
    }

    if (formatFilter) {
      items = items.filter(({ format }) => format === formatFilter);
    }

    if (statusFilter) {
      items = items.filter(({ status }) => `${status}`[0] === statusFilter);
    }

    filteredLogs = items;
  }

  const togglePinned = (log) => {
    const { ts } = log;
    if (currentPinned[ts]) {
      delete currentPinned[ts];
      addLogBack(log);
    } else {
      currentPinned[ts] = log;
    }

    pinned = {
      ...pinned,
      [currentRid]: currentPinned,
    };
  };

  $: {
    if (selectedLog && currentRid && !filteredLogs.includes(selectedLog)) {
      selectedLog = null;
    }
  }

  const selectLog = (log) => {
    selectedLog = selectedLog === log ? null : log;
  };
</script>

<div class="card">
  <header class="card-header">
    <p class="card-header-title">Logs</p>
  </header>

  <div class="field is-expanded is-marginless">
    <p class="control is-expanded has-icons-left">
      <input class="input is-radiusless is-small" type="text" placeholder="Filter">
      <span class="icon is-left is-small">
        <i class="mdi mdi-filter" aria-hidden="true"></i>
      </span>
    </p>
  </div>
  <footer class="card-footer">
    <ListFilter title="Method" items={allMethods} bind:value={methodFilter} />
    <ListFilter title="Format" items={allFormats} bind:value={formatFilter} />
    <ListFilter title="Status" items={allStatuses} bind:value={statusFilter} />
  </footer>

  {#if (!filteredLogs.length)}
    <hr class="is-marginless" />
  {/if}

  <nav class="panel is-marginless">
    {#each filteredLogs as log (log.ts)}
      <ListItem
        {log}
        {togglePinned}
        isSelected={selectedLog === log}
        isPinned={log.ts in currentPinned}
        {selectLog}
      />
    {/each}
  </nav>
</div>

<style>
  .card {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .panel {
    flex: 1;
  }

  nav.panel {
    overflow-x: hidden;
    overflow-y: auto;
  }
</style>
