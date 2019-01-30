<template lang="pug">
  .request-panel
    pre {{ log.path }}
    details(open)
      summary Summary
      log-summary(v-bind="summaryProps")
    details
      summary Models ({{ log.orm.length }} records)
      log-model(:orm="log.orm")
    details
      summary View ({{ log.view.length }} records)
      log-view(:views="log.view")
    details(v-if="log.exception" open)
      summary Error: {{ log.exception.message }} ({{ log.exception.type }})
      log-error(:error="log.exception")
</template>

<script>
import LogSummary, { LOG_SUMMARY_PROPS } from './LogSummary';
import LogModel from './LogModel';
import LogView from './LogView';
import LogError from './LogError';

export default {
  name: 'RequestPanel',
  props: ['log'],
  components: {
    LogSummary, LogModel, LogView, LogError,
  },
  computed: {
    summaryProps() {
      const { log } = this;
      return LOG_SUMMARY_PROPS.reduce((props, key) => ({ ...props, [key]: log[key] }), {});
    },
  },
};
</script>

<style lang="stylus">
.request-panel
  flex 1
  padding 0 10px
  position relative
  details
    max-width 100%
    pre
      overflow auto
      white-space pre-wrap
</style>
