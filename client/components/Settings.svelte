<script>
  import { LINK_MAKERS } from '../api/utils';

  $: links = Object.entries(LINK_MAKERS);
</script>

<div class="columns">
  <div class="column">
    <span class="title">Generate Links</span>
  </div>
  <div class="column">
    <div class="field has-addons">
      <div class="control wide-only">
        <label class="button is-static">Default Link</label>
      </div>

      <div class="control is-expanded">
        <div class="select is-fullwidth">
          <select>
            <option>(None)</option>
            {#each links.filter(([, { url }]) => url) as [key, item] (key)}
              <option value={key}>{item.title}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="columns is-multiline">
  {#each links as [key, item] (key)}
    <div class="column is-12">
      <span class="icon-abbr">
        {#if item.icon}
          <img src={item.icon} alt={item.title}>
        {:else}
          <div class="circle {item.abbr[0] === 'P' ? 'path' : 'url'}">{item.abbr}</div>
        {/if}
      </span>

      <span class="description">{item.title}</span>

      <div class="control with-margin">
        <label class="checkbox"><input type="checkbox">Copy</label>
      </div>

      <div class="control with-margin">
        {#if item.url}
          <label class="checkbox"><input type="checkbox">Link</label>
        {:else}
          <label class="checkbox" disabled><input type="checkbox" disabled>Link</label>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
.column {
  display: flex;
  align-items: center;
}

.column > .field.has-addons {
  width: 100%;
}

label.checkbox {
  display: flex;
  align-items: center;
}

label.checkbox > input[type=checkbox] {
  margin-right: 6px;
}

label.checkbox[disabled] {
  opacity: 0.5;
}

.icon-abbr {
  display: inline-flex;
  width: 36px;
  height: 36px;
  margin: 0 10px;
  align-items: stretch;
  justify-content: stretch;
}

.icon-abbr > img {
  padding: 5px;
}

.circle {
  color: white;
  font-size: 15px;
}

.icon-abbr > * {
  border: 1px solid #311b92;
  border-radius: 20px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.description {
  flex: 1;
}

.circle.path {
  background-color: #e91e63;
}

.circle.url {
  background-color: #1e88e5;
}

.control.with-margin {
  margin: 0 10px;
}
</style>
