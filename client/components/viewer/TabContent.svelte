<script>
  export let tab;
  export let current;

  $: isActive = current === tab;
</script>

<div class="tab-content content {isActive ? '' : 'is-hidden'}">
{#if isActive}
  <slot />
{/if}
</div>

<style>
.tab-content {
  font-family: 'Fira Code';
  font-size: 11pt;
}
</style>
