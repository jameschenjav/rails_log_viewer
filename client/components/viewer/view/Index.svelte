<script>
  import ByFile from './ByFile.svelte';

  import { linkParser } from '../../../stores/settings';

  export let view = null;

  let viewBuilder;
  let viewInfo;

  linkParser.subscribe((value) => { viewBuilder = value.buildViewStack.bind(value); });

  $: {
    try {
      viewInfo = viewBuilder && view && viewBuilder(view);
      // console.debug(viewInfo);
    } catch (e) {
      console.error(e);
    }
  }
</script>

<div class="view">
{#if viewInfo}
  <ByFile {viewInfo} />
{/if}
</div>
