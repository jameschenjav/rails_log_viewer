<template lang="pug">
  .log-summary
    pre
      | [{{ method }}] {{ path }} [{{ status }}]
      | format: {{ format }}
      .handle(v-if="sourcePath")
        a(:href="sourceUrl")
          | {{ controller }}\#{{ action }}
          br
          | Path: {{ sourcePath }}
      .handle(v-else)
        | Handled: {{ controller }}\#{{ action }}
      | Database: {{ dbTime }}
      | Views: {{ viewTime }}
    .params
      h3 Params
      pre {{ params }}
</template>

<script>
export const LOG_SUMMARY_PROPS = [
  'action',
  'controller',
  'db_runtime',
  'finished',
  'format',
  'method',
  'path',
  'source',
  'started',
  'status',
  'view_runtime',
  'params',
];

export default {
  name: 'LogSummary',
  props: LOG_SUMMARY_PROPS,
  computed: {
    dbTime() {
      const { db_runtime: time } = this;
      return time ? `${time.toFixed(1)} ms` : '-';
    },
    viewTime() {
      const { view_runtime: time } = this;
      return time ? `${time.toFixed(1)} ms` : '-';
    },
    sourcePath() {
      const { source } = this;
      return source ? `${source[0]}:${source[1]}` : null;
    },
    sourceUrl() {
      const { sourcePath } = this;
      return sourcePath && `vscode://file/${sourcePath}`;
    },
  },
};
</script>

<style lang="stylus">
.log-summary
  padding-left 10px
</style>
