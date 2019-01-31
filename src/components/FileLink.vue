<template lang="pug">
  .file-link
    a.file(:href="url") [{{ index }}] {{ display }}
    .context(v-if="context") ‘{{ context }}’
</template>

<script>
export default {
  name: 'FileLink',
  props: ['display', 'path', 'context', 'index'],
  computed: {
    url() {
      return `vscode://file/${this.path}`;
    },
  },
};
</script>

<style lang="stylus">
.file-link
  margin 5px
  *
    display inline-block
  .context
    margin-left 10px
</style>
