<script>
  import JsonValue from './JsonValue.svelte';
  import { copyJsonToClipboard } from '../../api/utils';

  export let data;

  $: value = data.value;

  $: itemData = {
    ...data,
    optionsMap: data.optionsMap,
  };

  let option = {};

  $: {
    const { optionsMap, optionGenerator } = data;
    option = (optionsMap && optionsMap.get(value))
      || (optionGenerator && optionGenerator(data, value.length))
      || { fold: false };
    option.onceOpen = option.onceOpen || !option.fold;
  }

  const toggleFoldding = () => {
    const isFoldding = !option.fold;
    option = {
      onceOpen: option.onceOpen || isFoldding,
      fold: isFoldding,
    };

    const { optionsMap } = data;
    if (!optionsMap) return;

    optionsMap.set(value, option);
  };

  $: iconClass = (option.fold
    ? 'has-text-info mdi-plus-box-outline'
    : 'has-text-grey mdi-minus-box-outline'
  );
</script>

{#if !value.length}
  <span class="json-array-open-close">[ ]</span>
{:else}
  <span class="json-array-open" title="{data.level}">[</span>
  <a href
    class="fold-toggle has-text-{option.fold ? 'info close' : 'grey open'}"
    on:click|preventDefault={toggleFoldding}
  >
    <i class="mdi mdi-{option.fold ? 'plus' : 'minus'}-box-outline"></i>
    <a href class="copy-clipboard" on:click|preventDefault|stopPropagation={() => copyJsonToClipboard(value)}>
      <i class="mdi mdi-content-copy"></i>
    </a>
    <span class="json-array-size">
      {value.length} items...
    </span>
  </a>
  {#if option.onceOpen || !option.fold}
    <div class="json-array-items {option.fold ? 'is-hidden' : ''}">
    {#each value as item}
      <div class="json-array-item">
        <div class="json-array-item-row">
          <JsonValue data={{ ...itemData, value: item }} /><span class="json-array-comma">,</span>
        </div>
      </div>
    {/each}
    </div>
  {/if}
  <span class="json-array-close">]</span>
{/if}

<style>
  .json-array-items {
    padding-left: 2ch;
    display: block;
  }

  .json-array-item {
    display: block;
  }

  .json-array-item-row {
    display: inline-block;
  }

  .json-array-item:last-child .json-array-comma {
    display: none;
  }

  .fold-toggle > .json-array-size {
    display: none;
    user-select: none;
  }

  .fold-toggle.close > .json-array-size, .fold-toggle.open:hover > .json-array-size {
    display: inline;
  }
</style>
