<script>
  import icons from '../assets/icons';

  export let name;
  export let title = null;
</script>

<i class="mdi-icon" title={title}>{@html icons[name]}</i>
