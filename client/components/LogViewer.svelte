<script>
  import ViewTab from './viewer/ViewTab.svelte';
  import TabContent from './viewer/TabContent.svelte';
  import Summary from './viewer/Summary.svelte';
  import JsonData from './json/JsonData.svelte';
  import { logMaps, PathLinkParser } from '../api/utils';
  import { linkParser } from '../stores/settings';

  export let log;
  export let server;

  $: {
    linkParser.update((oldlinkParser) => (server ? new PathLinkParser(server.path) : oldlinkParser));
  }

  let prevLog = null;

  let activeTab = 'summary';

  let options = null;

  const optionGenerator = ({ level }, size) => ({
    fold: (level > 0 && level % 3 === 0) || (level > 1 && size > 10),
  });

  const createOptionsMap = ({ orm, view }) => {
    const map = new WeakMap();
    map.set(orm, { fold: true });
    map.set(view, { fold: true });
    logMaps.set(log, map);
    return map;
  };

  $: {
    if (log !== prevLog) {
      activeTab = 'summary';
      prevLog = log;

      if (log) {
        options = {
          optionGenerator,
          optionsMap: logMaps.get(log) || createOptionsMap(log),
        };
      }
    }
  }
</script>

<div class="viewer">
  {#if log}
    <div class="tabs is-fullwidth">
      <ul>
        <ViewTab bind:current={activeTab} tab="summary">Summary</ViewTab>
        <ViewTab bind:current={activeTab} tab="db">Database</ViewTab>
        <ViewTab bind:current={activeTab} tab="view">View</ViewTab>
        <ViewTab bind:current={activeTab} tab="raw">Raw</ViewTab>
      </ul>
    </div>
    <TabContent current={activeTab} tab="summary">
      <Summary {log} />
    </TabContent>
    <TabContent current={activeTab} tab="db">
    </TabContent>
    <TabContent current={activeTab} tab="view">
    </TabContent>
    <TabContent current={activeTab} tab="raw">
      <JsonData json={log} {options} />
    </TabContent>
  {/if}
</div>

<style>
  .viewer {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
  }

  .tabs {
    flex: 0 0 auto;
  }
</style>
