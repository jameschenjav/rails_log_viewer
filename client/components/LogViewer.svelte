<script>
  import ViewTab from './viewer/ViewTab.svelte';
  import TabContent from './viewer/TabContent.svelte';
  import JsonData from './json/JsonData.svelte';

  import Summary from './viewer/summary/Index.svelte';
  import View from './viewer/view/Index.svelte';
  import Orm from './viewer/orm/Index.svelte';

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

  const createOptionsMap = ({ orm: o, view: v }) => {
    const map = new WeakMap();
    map.set(o, { fold: true });
    map.set(v, { fold: true });
    logMaps.set(log, map);
    return map;
  };

  $: {
    if (log !== prevLog) {
      activeTab = 'summary';
      prevLog = log;
      console.debug(log);

      if (log) {
        options = {
          optionGenerator,
          optionsMap: logMaps.get(log) || createOptionsMap(log),
        };
      }
    }
  }

  $: view = log && log.view;
  $: orm = log && log.orm;

  $: hasView = !!(view && view.length);
  $: hasOrm = !!(orm && orm.length);
</script>

<div class="viewer">
  {#if log}
    <div class="tabs is-fullwidth">
      <ul>
        <ViewTab bind:current={activeTab} tab="summary">Summary</ViewTab>
        {#if hasOrm}
        <ViewTab bind:current={activeTab} tab="db">Database</ViewTab>
        {/if}
        {#if hasView}
        <ViewTab bind:current={activeTab} tab="view">View</ViewTab>
        {/if}
        <ViewTab bind:current={activeTab} tab="raw">Raw</ViewTab>
      </ul>
    </div>
    <TabContent current={activeTab} tab="summary">
      <Summary {log} />
    </TabContent>
    {#if hasOrm}
    <TabContent current={activeTab} tab="db">
      <Orm {orm} />
    </TabContent>
    {/if}
    {#if hasView}
    <TabContent current={activeTab} tab="view">
      <View {view} />
    </TabContent>
    {/if}
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
