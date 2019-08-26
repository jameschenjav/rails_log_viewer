<script>
  import Icon from '../Icon.svelte';
  import JsonValue from './JsonValue.svelte';
  import { copyJsonToClipboard } from '../../api/utils';

  export let data;

  $: value = data.value;

  $: entries = Object.entries(value);

  $: separator = data.style === 'ruby' ? ' => ' : ': ';

  $: itemData = {
    ...data,
    level: data.level + 1,
  };

  let option = {};

  $: {
    const { optionsMap, optionGenerator } = data;
    option = (optionsMap && optionsMap.get(value))
      || (optionGenerator && optionGenerator(data, entries.length))
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
</script>

{#if !entries.length}
  <span class="json-object-open-close">{'{ }'}</span>
{:else}
  <span class="json-object-open" title="{data.level}">{'{'}</span>
  <a href
    class="fold-toggle has-text-{option.fold ? 'info close' : 'grey open'}"
    on:click|preventDefault={toggleFoldding}
  >
    <Icon name={option.fold ? 'plusBoxOutline' : 'minusBoxOutline'} />
    <a href class="copy-clipboard" on:click|preventDefault|stopPropagation={() => copyJsonToClipboard(value)}>
      <Icon name="contentCopy" />
    </a>
    <span class="json-object-size">
      {entries.length} entries...
    </span>
  </a>
  {#if option.onceOpen || !option.fold}
    <div class="json-object-entries {option.fold ? 'is-hidden' : ''}">
    {#each entries as [k, v]}
      <div class="json-object-entry">
        <div class="json-object-entry-row">
          <span class="json-object-key">{JSON.stringify(k)}</span>
          <span class="json-object-separator">{separator}</span>
          <JsonValue data={{ ...itemData, value: v }} /><span class="json-object-comma">,</span>
        </div>
      </div>
    {/each}
    </div>
  {/if}
  <span class="json-object-close">{'}'}</span>
{/if}

<style>
  .json-object-entries {
    padding-left: 2rem;
    display: block;
  }

  .json-object-entry {
    display: block;
  }

  .json-object-entry-row {
    display: inline-block;
  }

  .json-object-entry:last-child .json-object-comma {
    display: none;
  }

  .fold-toggle > .json-object-size {
    display: none;
    user-select: none;
  }

  .fold-toggle.close > .json-object-size, .fold-toggle.open:hover > .json-object-size {
    display: inline;
  }
</style>
