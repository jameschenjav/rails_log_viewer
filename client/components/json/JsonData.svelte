<script>
  import JsonValue from './JsonValue.svelte';
  import { copyJsonToClipboard } from '../../api/utils';

  export let json;
  export let options;
  export let extraOptions = false;

  let data = {};

  let style = 'json';

  $: {
    data = {
      value: json,
      level: 0,
      ...({
        optionsMap: new WeakMap(),
        optionGenerator: () => ({ fold: false }),
        ...(data.options || options),
      }),
      style,
    };
  }
</script>

<div class="box">
  {#if extraOptions}
    <div class="control">
      <label class="radio">
        <input type="radio" bind:group={style} name="style" value="json">
        JSON
      </label>
      <label class="radio">
        <input type="radio" bind:group={style} name="style" value="ruby">
        Ruby
      </label>
      <a href class="button is-small" on:click|preventDefault={() => copyJsonToClipboard(json)}>
        <span class="icon">
          <i class="mdi mdi-content-copy"></i>
        </span>
        <span>Copy</span>
      </a>
    </div>
  {/if}
  <pre class="json-block">
    <JsonValue {data} />
  </pre>
</div>

<style>
  .box {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  pre.json-block {
    display: block;
    white-space: pre-wrap !important;
    text-align: left;
    margin-top: 10px;
    flex: 1;
    overflow: auto;
  }
</style>
