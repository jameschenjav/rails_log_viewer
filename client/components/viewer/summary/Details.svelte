<script>
  import { format } from 'date-fns';

  export let log;

  $: startedAt = new Date(log.started);
  $: finishedAt = new Date(log.finished);

  const formatRuntime = (tm) => (tm ? tm.toFixed(1) : '-');
</script>

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

<style>
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
