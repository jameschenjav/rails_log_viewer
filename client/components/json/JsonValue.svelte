<script>
  import JsonObject from './JsonObject.svelte';
  import JsonArray from './JsonArray.svelte';

  export let data;

  $: value = data.value;
</script>

{#if Array.isArray(value)}
  <JsonArray data={data} />
{:else if typeof value === 'object' && value !== null}
  <JsonObject data={data} />
{:else if value === null}
  <span class="json-value json-null">null</span>
{:else if typeof value === 'string'}
  <span class="json-value json-string">{JSON.stringify(value)}</span>
{:else if typeof value === 'number'}
  <span class="json-value json-number">{value}</span>
{:else if typeof value === 'boolean'}
  <span class="json-value json-boolean">{value}</span>
{:else}
  <span class="json-value json-unknown">{value}</span>
{/if}

<style>
.json-string {
  color: #7b1fa2;
  word-break: break-all;
}

.json-number {
  color: #0288d1;
}

.json-boolean {
  color: #f57c00;
}

.json-null {
  color: #d32f2f;
}
</style>
