<script>
  import { linkParser } from '../../../stores/settings';

  export let orm = null;

  let ormBuilder;
  let ormInfo;

  linkParser.subscribe((value) => { ormBuilder = value.buildViewStack.bind(value); });

  $: {
    try {
      ormInfo = ormBuilder && orm && ormBuilder(orm);
      console.debug(ormInfo);
    } catch (e) {
      console.error(e);
    }
  }
</script>

<div class="orm">
{#if ormInfo}
  {ormInfo}
{/if}
</div>
