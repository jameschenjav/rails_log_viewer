<template lang="pug">
  .request-panel
    .scrollable {{ log.path }}
    .basic(:class="`status-${status}`") {{ basicInfo }}
    .tab.menu
      a.tab(@click="switchTab('summary')" :class="{active: tab === 'summary'}")
        | Summary
      a.tab(@click="switchTab('models')" :class="{active: tab === 'models'}")
        | Models ({{ log.orm.length }} records)
      a.tab(@click="switchTab('views')" :class="{active: tab === 'views'}")
        | Views ({{ log.view.length }} records)
    .tab-body
      log-summary(v-bind="summaryProps" v-if="tab === 'summary'")
      log-model(:orm="log.orm" v-if="tab === 'models'")
      log-view(:views="log.view" v-if="tab === 'views'")
</template>

<script>
import LogSummary from './LogSummary';
import LogModel from './LogModel';
import LogView from './LogView';

const timeStr = ms => (ms ? `${ms.toFixed(1)}ms` : '-');

export default {
  name: 'RequestPanel',
  props: ['log', 'folder'],
  components: { LogSummary, LogModel, LogView },

  data: () => ({ tab: 'summary' }),

  computed: {
    summaryProps() {
      const {
        folder,
        log: {
          exception: error,
          format: response,
          source,
          controller: controllerClass,
          params: {
            controller, action, format, ...params
          },
        },
      } = this;
      return {
        error,
        params,
        source: {
          controllerClass,
          controller,
          action,
          format,
          response,
          folder,
          sourcePath: source && `${source[0]}:${source[1]}`,
        },
      };
    },

    basicInfo() {
      const {
        log: {
          method,
          status = 500,
          format,
          timespan,
          db_runtime: dbTime,
          view_runtime: viewTime,
        },
      } = this;

      const time = `${timespan}ms (Views: ${timeStr(dbTime)} | Db: ${timeStr(viewTime)})`;
      // [{{ log.format }}] {{ log.timespan }}ms (Views: {{ viewTime }} | Db: {{ dbTime }})
      return `[${method}] ${status} - ${format}: ${time}`;
    },

    status() {
      const { log: { status = 500 } } = this;
      return `${status.toString()[0]}00`;
    },
  },

  methods: {
    switchTab(tab) {
      this.tab = tab;
    },
  },

  watch: {
    log() {
      this.tab = 'summary';
    },
  },
};
</script>

<style lang="stylus">
.request-panel
  position relative
  padding 0 10px
  width 960px
  display flex
  flex-direction column
  .basic
    font-size 85%
    padding 5px
  details
    max-width 100%
  .scrollable
    white-space pre
    width 100%
    overflow-x auto
    background-color #EEE
    padding 6px 10px
  .tab.menu
    width 100%
    background-color #CCC
    position relative
    display flex
    align-content stretch
    align-items center
    border-top-left-radius 10px
    border-top-right-radius 10px
    border-bottom 1px solid #AAA
    a.tab
      cursor pointer
      padding 6px 15px
      border-top 2px solid #CCC
      border-right 1px solid #AAA
      &:first-child
        border-top-left-radius 10px
      &.active
        border-color #444
        background-color #444
        color white
  .tab-body
    border 1px solid #EEE
    border-top none
    flex 1
    overflow auto
    position relative
</style>
