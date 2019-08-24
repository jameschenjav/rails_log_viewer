<script>
  import { settings, linkParser } from '../stores/settings';
  import { generateLink } from '../api/utils';

  export let path;

  let linkSetting = {};
  let parseLink = () => '';

  settings.subscribe((value) => { linkSetting = value; });
  linkParser.subscribe((value) => { parseLink = value.parse.bind(value); });

  $: data = parseLink(path);

  $: link = generateLink(data, linkSetting);
</script>

<a href={link.link} title={link.title}>{link.text}</a>

<style>
</style>
