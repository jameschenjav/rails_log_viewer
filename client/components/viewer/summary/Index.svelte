<script>
  import { logMaps } from '../../../api/utils';

  import Exception from './Exception.svelte';
  import Details from './Details.svelte';
  import JsonData from '../../json/JsonData.svelte';
  import Link from '../../Link.svelte';

  export let log;

  $: sourceFullPath = (log.source || []).join(':');

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
  <Details {log} />

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

    <Exception {log} />
  </div>
</div>

<style>
.summary {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.row {
  display: flex;
  margin: 5px 3px;
  flex: 0 0 auto;
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
