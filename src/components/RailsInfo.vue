<template lang="pug">
  pre.rails-info
    a.title(:href="`#${server.pid}`" @click.prevent="$emit('click', server)") {{ basicInfo }}
    a.file.small(:href="editorUrl") [Open in VSCode]
    .small  {{ server.path }}
</template>

<script>
export default {
  name: 'RailsInfo',
  props: ['server'],
  computed: {
    basicInfo() {
      const {
        pid, version, port, mode, ruby,
      } = this.server;
      return `#${pid} on :${port} [${mode}] (Rails ${version}, Ruby v${ruby})`;
    },
    editorUrl() {
      const { path } = this.server;
      return `vscode://file/${path}`;
    },
  },
};
</script>

<style lang="stylus">
.rails-info
  text-align left
  .title
    display block
    font-size 110%
    margin-bottom 3px
  .small
    display inline
    font-size 90%
</style>
