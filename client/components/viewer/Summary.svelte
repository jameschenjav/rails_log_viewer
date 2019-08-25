<script>
  import { format } from 'date-fns';
  import { logMaps } from '../../api/utils';

  import JsonData from '../json/JsonData.svelte';
  import Link from '../Link.svelte';

  export let log;

  let exception = null;
  let fullStack = false;

  $: sourceFullPath = (log.source || []).join(':');

  $: startedAt = new Date(log.started);
  $: finishedAt = new Date(log.finished);

  const formatRuntime = (tm) => (tm ? tm.toFixed(1) : '-');

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

  let prevException = null;

  $: {
    if (log.exception) {
      const {
        backtrace = [],
        type, message, original,
        ...others
      } = log.exception;

      exception = {
        backtrace,
        type,
        message,
        original,
        others: Object.keys(others).length ? JSON.stringify(others, null, '\t') : null,
      };
      console.log(log);
    } else {
      exception = null;
    }

    if (log.exception !== prevException) {
      prevException = log.exception;
      fullStack = false;
    }
  }
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
      {format(startedAt, 'HH:mm:ss.SSS')}
    </span>
    <span class="col">
      <span class="subject">Finished</span>
      {format(finishedAt, 'HH:mm:ss.SSS')}
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
      <Link path={sourceFullPath} />
    </span>
  </div>

  <div class="row logs">
    <span class="col">
      <div class="subject">Params</div>
      <JsonData json={log.params} options={jsonOptions} extraOptions />
    </span>

    {#if exception}
      <span class="col">
        <div class="subject">Exception</div>
        <div class="exception box">
          <div class="row">
            <span class="col has-text-danger">
              {#if exception.original}
                <span class="subject" title={exception.type}>{exception.original}</span>
              {:else}
                <span class="subject">{exception.type}</span>
              {/if}
              {exception.message}
            </span>
          </div>

          {#if exception.others}
            <div class="row">
              <span class="col">
                <pre>{exception.others}</pre>
              </span>
            </div>
          {/if}

          <div class="row">
            <div class="control">
              <label class="radio">
                <input type="radio" bind:group={fullStack} name="style" value={false}>
                App Folder Only
              </label>
              <label class="radio">
                <input type="radio" bind:group={fullStack} name="style" value={true}>
                Full Exception Stack
              </label>
            </div>
          </div>

          <div class="backtrace {fullStack ? 'full-stack' : 'app-folder-only'}">
            {#each exception.backtrace as link}
              <Link path={link} />
            {/each}
          </div>
        </div>
      </span>
    {/if}
  </div>
</div>

<style>
.summary, .exception.box {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.backtrace {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
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

.row.logs {
  flex: 1;
  overflow: hidden;
}

.logs.row > .col {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100px;
}
</style>
