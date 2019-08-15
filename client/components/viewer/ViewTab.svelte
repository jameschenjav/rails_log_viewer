<script>
  export let tab;
  export let current;
</script>

<li class="{current === tab ? 'is-active' : ''}">
  <a href on:click|preventDefault={() => { current = tab; }}>
    <slot />
  </a>
</li>
