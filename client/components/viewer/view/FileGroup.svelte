<script>
  import Link from '../../Link.svelte';

  export let group;
</script>

<div class="group">
{#each group as [title, { path, lines }]}
  <div class="path">
    <Link {path}>{title}</Link>
    <div class="lines">
      {#each lines as { line, depth, count, desc }}
        <div class="line">
          <Link path={`${path}:${line}`} extraText={desc}>{line} @{depth}</Link>
        </div>
      {/each}
    </div>
  </div>
{/each}
</div>

<style>
  .group {
    padding-left: 2ch;
  }

  .path {
    margin-bottom: 5px;
  }

  .lines {
    padding-left: 1ch;
  }

  .line {
    margin-left: 18px;
    display: inline-block;
  }
</style>
