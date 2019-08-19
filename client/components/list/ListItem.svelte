<script>
  import { format } from 'date-fns';

  export let log;
  export let isPinned;
  export let isSelected;
  export let togglePinned;
  export let selectLog = () => {};

  const METHOD_COLOR_CLASSES = {
    get: 'is-info',
    post: 'is-success',
    put: 'is-warning',
    patch: 'is-warning',
    delete: 'is-danger',
  };

  const getMethodClass = ({ method }) => METHOD_COLOR_CLASSES[(method || '').toLowerCase()] || 'is-primary';

  const STATUS_COLOR_CLASSES = {
    1: 'is-link',
    2: 'is-success',
    3: 'is-info',
    4: 'is-warning',
    5: 'is-danger',
  };

  const getStatusClass = ({ status }) => STATUS_COLOR_CLASSES[`${status}`[0]] || 'is-primary';

  const durationOf = ({ finished, started }) => {
    const d = Date.parse(finished) - Date.parse(started);
    return d > 5000 ? `${(d / 1000).toFixed(1)}s` : `${d}ms`;
  };

  const shortPath = ({ path }) => {
    const r = path.slice(path.lastIndexOf('/') + 1);
    return r || path;
  };
</script>

<div class="panel-block is-size-7 {isSelected ? 'is-active has-background-link has-text-white' : 'non-select'}">
  <div class="row tags-row">
    <span class="time">
      <a href
        class="icon pin {isPinned ? 'has-background-link' : 'has-background-warning'}"
        on:click|preventDefault={() => togglePinned(log)}
      >
        <i class="mdi {isPinned ? 'mdi-pin-off has-text-white' : 'mdi-pin has-text-black'}"></i>
      </a>
      <div class="time-block">
        <span class="wide-only">{format(log.started, 'HH:')}</span>
        <span>{format(log.started, 'mm:ss')}</span>
        <span class="wide-only">{format(log.started, '.SSS')}</span>
      </div>
    </span>

    <span class="tag is-marginless is-lowercase small-only {getStatusClass(log)}">
      {log.method} {log.format} {log.status}
    </span>

    <div class="tags has-addons is-marginless wide-only">
      <span class="tag is-marginless {getMethodClass(log)}">{log.method}</span>
      <span class="tag is-marginless is-dark is-uppercase">{log.format}</span>
    </div>
    <span class="tag is-marginless wide-only {getStatusClass(log)}">{log.status}</span>

    <span class="duration has-text-right">{durationOf(log)}</span>
  </div>
  <a href
    class="row no-wrap link {isSelected ? 'has-text-link' : ''}"
    title={log.path}
    on:click|preventDefault={() => selectLog(log)}
  >
    <span class="small-only">{shortPath(log)}</span>
    <span class="wide-only">{log.path}</span>
  </a>
</div>

<style>
  .panel-block {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .row.tags-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .time-block {
    display: inline-flex;
  }

  .duration {
    width: 50px;
  }

  .icon.pin {
    border-radius: 5px;
  }

  a.link {
    margin-top: 2px;
    padding: 0.5em 1em;
    border-radius: 6px;
    overflow-x: hidden;
    text-overflow: ellipsis;
    background-color: white;
  }

  a.link:hover {
    background-color: #EEE;
  }
</style>
