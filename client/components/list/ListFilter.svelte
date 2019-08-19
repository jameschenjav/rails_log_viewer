<script>
  export let title;
  export let items;
  export let value;

  $: selectId = `${title}-id`.toLowerCase();

  $: pairs = items.map((x) => [x].flat()).map(([v, t = v]) => [v, t]);
</script>

<div class="card-footer-item is-paddingless">
  <div class="field has-addons">
    <div class="control wide-only">
      <label class="button is-static is-small" for={selectId}>{title}:</label>
    </div>

    <div class="control is-expanded">
      <div class="select is-fullwidth is-small">
        <select id={selectId} bind:value={value}>
          <option value="">All</option>
          {#each pairs as [val, label] (val)}
            <option value={val}>{label}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>
</div>

<style>
  .field.has-addons {
    width: 100%;
  }

  .field.has-addons * {
    border: none;
    border-radius: 0;
  }

  .field.has-addons .button.is-static {
    color: green;
    background-color: transparent;
    border-right: 1px solid #EEE;
  }
</style>
