<script>
  import Icon from './Icon.svelte';
  import { LINK_MAKERS } from '../api/utils';
  import { settings, getDefaultSettings } from '../stores/settings';

  let links = [];
  let defaultAction = '';

  settings.subscribe(({ defaultAction: action, enabled }) => {
    defaultAction = action;
    links = Object.entries(LINK_MAKERS).map(([key, attrs]) => {
      const options = enabled[key] || [];
      return [key, {
        ...attrs,
        open: options.includes('open'),
        copy: options.includes('copy'),
      }];
    });
  });

  const getOptions = (options) => ['copy', 'open'].filter((subject) => options[subject]);

  const syncSettings = () => {
    const newSettings = {
      defaultAction,
      enabled: Object.fromEntries(
        links
          .map(([key, options]) => [key, getOptions(options)])
          .filter(([, options]) => options.length),
      ),
    };
    localStorage.setItem('settings', JSON.stringify(newSettings));
    settings.update(() => newSettings);
  };

  const changedefaultAction = (e) => {
    defaultAction = e.target.value;
    syncSettings();
  };

  const toggleItem = (item, subject) => {
    // eslint-disable-next-line no-param-reassign
    item[subject] = !item[subject];
    syncSettings();
  };

  const resetDefaults = () => {
    localStorage.removeItem('settings');
    settings.update(getDefaultSettings);
  };
</script>

<div class="columns">
  <div class="column">
    <span class="title">Generate Links</span>
  </div>
  <div class="column">
    <div class="field has-addons">
      <div class="control wide-only">
        <label class="button is-static">Default:</label>
      </div>

      <div class="control is-expanded">
        <div class="select is-fullwidth">
          <select value={defaultAction} on:change={changedefaultAction}>
            <option>(None)</option>
            {#each links as [key, item] (key)}
              {#if item.url}
                <option value={`${key}.open`}>Open: {item.title}</option>
              {/if}
              <option value={`${key}.copy`}>Copy: {item.title}</option>
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
      <span class="settings icon-abbr">
        {#if item.icon}
          <Icon name={item.icon} />
        {:else}
          <div class="circle {item.abbr[0] === 'P' ? 'path' : 'url'}">{item.abbr}</div>
        {/if}
      </span>

      <span class="description">{item.title}</span>

      <div class="control with-margin">
        <label class="checkbox">
          <input type="checkbox" checked={item.copy} on:change={() => toggleItem(item, 'copy')}>Copy
        </label>
      </div>

      <div class="control with-margin">
        {#if item.url}
          <label class="checkbox">
            <input type="checkbox" checked={item.open} on:change={() => toggleItem(item, 'open')}>Open
          </label>
        {:else}
          <label class="checkbox" disabled><input type="checkbox" disabled>Open</label>
        {/if}
      </div>
    </div>
  {/each}

  <div class="column is-12">
    <button class="button is-primary" on:click={resetDefaults}>Reset to Defaults</button>
  </div>

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

.circle {
  color: white;
  font-size: 15px;
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
