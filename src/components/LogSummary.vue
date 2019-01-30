<template lang="pug">
  .log-summary
    | Controller: {{ controller }}
    | Action: {{ action }}, format: {{ format }} (response: {{ response }})
    p
      a.file(:href="sourceUrl")
        | [{{ controllerClass }}\#{{ action }}]
      | {{ source.sourcePath }}
    .params
      h3 Params
      .scrollable {{ params }}
    .error(v-if="error")
      h3 Error: {{ error.message }} ({{ error.type }})
      | {{ error }}
</template>

<script>
import LogError from './LogError';

const SPREAD_PROP = [
  'controllerClass',
  'controller',
  'action',
  'format',
  'response',
  'folder',
];

export default {
  name: 'LogSummary',
  props: ['source', 'params', 'error'],
  components: { LogError },

  computed: {
    ...SPREAD_PROP.reduce((fns, name) => ({
      ...fns,
      [name]() {
        return this.source[name];
      },
    }), {}),
    sourceUrl() {
      const { source: { sourcePath } } = this;
      return sourcePath && `vscode://file/${sourcePath}`;
    },
  },
};
</script>

<style lang="stylus">
.log-summary
  padding 8px 12px 5px 12px
  a
    display block
</style>
