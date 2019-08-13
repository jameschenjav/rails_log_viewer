<script>
  export let logs = [];
  export let active = null;
  export let pinned = [];
</script>

<div class="column is-4-widescreen is-4-desktop is-12-mobile logs">
  <nav class="panel">
    <p class="panel-heading">Logs</p>
    <div class="panel-block">
      <p class="control has-icons-left">
        <input class="input" type="text" placeholder="search">
        <span class="icon is-left">
          <i class="mdi mdi-magnify" aria-hidden="true"></i>
        </span>
      </p>
    </div>

    {#each logs as log (log.ts)}
      <a href
        class="panel-block is-size-7"
        on:click|preventDefault={() => {}}
      >
        {log.path}
      </a>
    {/each}
  </nav>
</div>
