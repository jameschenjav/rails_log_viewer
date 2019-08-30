<script>
  import Link from '../../Link.svelte';

  export let log;

  let exception = null;
  let prevException = null;
  let fullStack = false;

  $: {
    if (log.exception) {
      const {
        backtrace = [],
        type, message, original,
        ...others
      } = log.exception;

      exception = {
        backtrace: backtrace.filter((x) => x.startsWith('/')),
        type,
        message,
        original,
        others: Object.keys(others).length ? JSON.stringify(others, null, '\t') : null,
      };
    } else {
      exception = null;
    }

    if (log.exception !== prevException) {
      prevException = log.exception;
      fullStack = false;
    }
  }

</script>

{#if exception}
  <div class="col">
    <div class="subject">Exception</div>
    <div class="exception box">
      <div class="row">
        <span class="col has-text-danger">
          {#if exception.original}
            <span class="subject" title={exception.type}>{exception.original}</span>
          {:else}
            <span class="subject">{exception.type}</span>
          {/if}
          {exception.message}
        </span>
      </div>

      {#if exception.others}
        <div class="row">
          <span class="col">
            <pre>{exception.others}</pre>
          </span>
        </div>
      {/if}

      <div class="row">
        <div class="control">
          <label class="radio">
            <input type="radio" bind:group={fullStack} name="style" value={false}>
            App Folder Only
          </label>
          <label class="radio">
            <input type="radio" bind:group={fullStack} name="style" value={true}>
            Full Exception Stack
          </label>
        </div>
      </div>

      <div class="backtrace {fullStack ? 'full-stack' : 'app-folder-only'}">
        {#each exception.backtrace as link}
          <Link path={link} />
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
div.col {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.exception.box {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.backtrace {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
}
</style>
