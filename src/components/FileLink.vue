<template lang="pug">
  .file-link
    a.file(:href="url") {{ text }}
    .context(v-if="context") ‘{{ context }}’
</template>

<script>
export default {
  name: 'FileLink',
  props: ['display', 'path', 'context', 'index'],
  computed: {
    text() {
      const { index, display, path } = this;
      return `${Number.isInteger(index) ? `[${index}] ` : ''}${display || path}`;
    },
    url() {
      const { path, display } = this;
      return `vscode://file/${path || display}`;
    },
  },
};
</script>

<style lang="stylus">
.file-link
  *
    display inline-block
  .context
    margin-left 10px
</style>
