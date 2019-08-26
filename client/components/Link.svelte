<script>
  import Icon from './Icon.svelte';
  import { settings, linkParser } from '../stores/settings';
  import { generateLink, copy } from '../api/utils';

  export let path;

  let linkSetting = {};
  let parseLink = () => '';

  settings.subscribe((value) => { linkSetting = value; });
  linkParser.subscribe((value) => { parseLink = value.parse.bind(value); });

  $: data = parseLink(path);

  $: link = generateLink(data, linkSetting);

  const copyLink = ({ link: url }) => {
    copy(url);
  };
</script>

<div class="link-wrap {link.isChild ? 'child' : 'fullpath'}">
{#if link.action === 'copy'}
  <a href={link.link} title={link.title} on:click|preventDefault={() => copyLink(link)}>
    <Icon name="contentCopy" title={`Copy: ${link.link}`} />
    <span class="link">
      <span class="path">{link.text}</span>
      {#if link.extraText}<span class="info">{link.extraText}</span>{/if}
    </span>
  </a>
{:else if link.action === 'open'}
  <a href={link.link} title={link.title}>
    <Icon name="openInNew" title={`Open: ${link.link}`} />
    <span class="link">
      <span class="path">{link.text}</span>
      {#if link.extraText}<span class="info">{link.extraText}</span>{/if}
    </span>
  </a>
{:else}
  <span title={link.title} class="text">
    <span class="path">{link.text}</span>
    {#if link.extraText}<span class="info">{link.extraText}</span>{/if}
  </span>
{/if}

{#if link.extra.copy.length || link.extra.open.length}
  <div class="extra field has-addons">
  {#if link.extra.copy.length}
    <div class="control">
      <div class="dropdown is-hoverable">
        <div class="dropdown-trigger">
          <div class="is-small button">
            <span class="icon"><Icon name="contentCopy" /></span>
          </div>
        </div>

        <div class="dropdown-menu copy">
          <div class="dropdown-content">
            <div class="dropdown-item">
              Copy:
              {#each link.extra.copy as item}
              <a href={item.link} class="icon-abbr" on:click|preventDefault={() => copyLink(item)}>
                {#if item.icon}
                  <Icon name={item.icon} title={item.title} />
                {:else}
                  <div class="circle {item.abbr[0] === 'P' ? 'path' : 'url'}" title={item.title}>{item.abbr}</div>
                {/if}
              </a>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if link.extra.open.length}
    <div class="control">
      <div class="dropdown is-hoverable">
        <div class="dropdown-trigger">
          <div class="is-small button">
            <span class="icon"><Icon name="openInNew" /></span>
          </div>
        </div>

        <div class="dropdown-menu open">
          <div class="dropdown-content">
            <div class="dropdown-item">
              Open:
              {#each link.extra.open as item}
              <a href={item.link} class="icon-abbr">
                {#if item.icon}
                  <Icon name={item.icon} title={item.title} />
                {:else}
                  <div class="circle {item.abbr[0] === 'P' ? 'path' : 'url'}" title={item.title}>{item.abbr}</div>
                {/if}
              </a>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
  </div>
{/if}
</div>

<style>
.link-wrap, a, span.text {
  display: inline-flex;
  align-items: center;
}

.link-wrap > a {
  margin-right: 4px;
}

a > .info, span.text > .info {
  margin-left: 3px;
}

.link-wrap > a {
  word-break: break-all;
  margin-right: 4px;
}

.link-wrap > span.text {
  word-break: break-all;
  margin-right: 4px;
  color: #ff3860;
}

.dropdown-menu {
  min-width: auto;
}

.dropdown-menu {
  right: 100%;
  left: auto;
  top: 50%;
  transform: translateY(-50%);
}

.dropdown-item {
  display: flex;
  padding: 3px 12px;
}

.icon-abbr {
  display: inline-flex;
  width: 24px;
  height: 24px;
  margin: 0 2px;
  align-items: stretch;
  justify-content: stretch;
}

.circle {
  color: white;
  font-size: 12px;
}

.icon-abbr > * {
  border: 1px solid #311b92;
  border-radius: 5px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.icon-abbr:first-child {
  margin-left: 0;
}

.icon-abbr:last-child {
  margin-right: 0;
}

.circle.path {
  background-color: #e91e63;
}

.circle.url {
  background-color: #1e88e5;
}

.link > .info {
  color: #444;
  font-size: 80%;
  user-select: none;
}
</style>
