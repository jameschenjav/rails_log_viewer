<script>
  import { format } from 'date-fns';

  export let log;

  const formatRuntime = (tm) => (tm && tm.toFixed(1));
</script>

<div class="summary">
  <div class="row">
    <div class="col">Method: {log.method}</div>
    <div class="col">Format: {log.format}</div>
    <div class="col">Status: {log.status}</div>
  </div>

  <div class="row">
    <div class="col">{log.path}</div>
  </div>

  <div class="row">
    <div class="col">Started: {format(log.started, 'HH:mm:ss.SSS')}</div>
    <div class="col">Finished: {format(log.finished, 'HH:mm:ss.SSS')}</div>
    <div class="col">Database: {formatRuntime(log.db_runtime)}</div>
    <div class="col">View: {formatRuntime(log.view_runtime)} ms</div>
  </div>

  <div class="row">
    <div class="col">Controller: {log.controller}</div>
    <div class="col">action: {log.action}</div>
  </div>

  <div class="row">
    <div class="col">File: {log.source.join(':')}</div>
  </div>
</div>

<style>
.row {
  display: flex;
}

.col {
  flex: 1;
}
</style>
