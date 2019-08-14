<script>
  export let log;
</script>

<div class="viewer">
  <pre>{JSON.stringify(log, null, 2)}</pre>
</div>

<style>
  .viewer {
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  pre {
    white-space: pre-wrap;
  }
</style>
