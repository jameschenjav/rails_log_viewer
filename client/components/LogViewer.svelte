<script>
  import ViewTab from './viewer/ViewTab.svelte';
  import TabContent from './viewer/TabContent.svelte';
  import Summary from './viewer/Summary.svelte';

  export let log;

  let prevLog = null;

  let activeTab = 'summary';

  $: {
    if (log !== prevLog) {
      activeTab = 'summary';
      prevLog = log;
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
      <pre class="wrap  {log ? '' : 'is-hidden'}">{JSON.stringify(log, null, 2)}</pre>
    </TabContent>
  {/if}
</div>

<style>
  .viewer {
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  pre.wrap {
    white-space: pre-wrap !important;
    font-size: 0.8rem;
  }
</style>
