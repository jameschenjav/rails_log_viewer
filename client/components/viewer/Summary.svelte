<script>
  import { format } from 'date-fns';
  import JsonData from '../json/JsonData.svelte';
  import { logMaps, vscodeLinker } from '../../api/utils';

  export let log;
  export let pathLinkGen;

  $: sourceFullPath = (log.source || []).join(':');

  $: sourceLink = sourceFullPath && vscodeLinker(pathLinkGen.parse(sourceFullPath));

  const formatRuntime = (tm) => (tm && tm.toFixed(1));

  const optionGenerator = ({ level }, size) => ({
    fold: level > 0 && (level % 2 === 0 || size > 20),
  });

  const getOptionsMap = () => {
    const m = logMaps.get(log);
    if (m) return m;

    const map = new WeakMap();
    logMaps.set(log, map);
    return map;
  };

  $: jsonOptions = {
    optionGenerator,
    optionsMap: getOptionsMap(),
  };
</script>

<div class="summary">
  <div class="row">
    <span class="col">
      <span class="subject">Method</span>
      {log.method}
    </span>
    <span class="col">
      <span class="subject">Format</span>
      {log.format}
    </span>
    <span class="col">
      <span class="subject">Status</span>
      {log.status}
    </span>
  </div>

  <div class="row">
    <span class="col">
      <span class="subject">Started</span>
      {format(log.started, 'HH:mm:ss.SSS')}
    </span>
    <span class="col">
      <span class="subject">Finished</span>
      {format(log.finished, 'HH:mm:ss.SSS')}
    </span>
    <span class="col">
      <span class="subject">DB</span>
      {formatRuntime(log.db_runtime)} ms
    </span>
    <span class="col">
      <span class="subject">View</span>
      {formatRuntime(log.view_runtime)} ms
    </span>
  </div>

  <div class="row path">
    <span class="subject">Path</span>
    <code>{log.path}</code>
  </div>

  <div class="row">
    <span class="col">
      <span class="subject">Controller</span>
      {log.controller}
    </span>
    <span class="col">
      <span class="subject">Action</span>
      {log.action}
    </span>
  </div>

  <div class="row">
    <span class="col">
      <span class="subject">Source File</span>
      {#if sourceLink}
        <a href={sourceLink.link} title={sourceLink.path}>{sourceLink.text}</a>
      {/if}
    </span>
  </div>

  <div class="row">
    <div class="subject">Params</div>
  </div>
  <JsonData json={log.params} options={jsonOptions} extraOptions />
</div>

<style>
.summary {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.row {
  display: flex;
  margin: 5px 3px;
  flex: 0 0 auto;
}

.row.path {
  margin: 10px 3px;
  align-items: center;
}

.col {
  flex: 1;
}

.subject {
  font-weight: bold;
}

.subject::after {
  content: ': '
}

.row.path code {
  flex: 1;
  word-break: break-all;
  margin-left: 1ch;
}
</style>
