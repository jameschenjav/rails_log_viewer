<template lang="pug">
  .request-panel
    .scrollable {{ log.path }}
    .basic(:class="`status-${status}`") {{ basicInfo }}
    .tab.menu
      a.tab(@click="switchTab('summary')" :class="{active: tab === 'summary'}")
        | Summary
      a.tab(@click="switchTab('views')" :class="{active: tab === 'views'}")
        | Rendered ({{ log.view.length }} views: {{ viewTime }})
      a.tab(@click="switchTab('models')" :class="{active: tab === 'models'}")
        | Models ({{ log.orm.length }} records: {{ dbTime }})
    .tab-body
      log-summary(v-bind="summaryProps" v-if="tab === 'summary'")
      log-view(:views="views" :folder="folder" v-if="tab === 'views'")
      log-model(:orm="log.orm" v-if="tab === 'models'")
</template>

<script>
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';

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

    dbTime() {
      const { log: { db_runtime: time } } = this;
      return timeStr(time);
    },

    viewTime() {
      const { log: { view_runtime: time } } = this;
      return timeStr(time);
    },

    basicInfo() {
      const {
        log: {
          method,
          status = 500,
          format,
          timespan,
        },
      } = this;

      return `[${method}] ${status} - ${format} (${timespan}ms)`;
    },

    status() {
      const { log: { status = 500 } } = this;
      return `${status.toString()[0]}00`;
    },

    views() {
      const { log, folder } = this;
      const chopLength = folder.length + 1;
      if (!log) return [];

      const views = log.view.map(({
        event, started, finished, stack, identifier,
      }) => {
        const path = identifier.startsWith(folder) ? identifier.slice(chopLength) : identifier;
        return {
          path,
          stack,
          time: differenceInMilliseconds(finished, started),
          event: event.split('.')[0],
        };
      });

      views.sort((
        {
          path: p1, stack: s1, d1 = s1.length, event: e1,
        },
        {
          path: p2, stack: s2, d2 = s2.length, event: e2,
        },
      ) => {
        const d = d2 - d1;
        if (d !== 0) return d;

        const s = p1.localeCompare(p2);
        return s === 0 ? e1.localeCompare(e2) : s;
      });

      const groups = [];
      let last = {};
      views.forEach((v) => {
        const { path, event, stack } = v;
        const { path: lp, event: le, stack: ls } = last;
        if (path === lp && event === le && stack[0] === ls[0]) {
          last.time += v.time;
          last.count += 1;
          return;
        }

        last = v;
        last.count = 1;
        groups.push(last);
      });

      return groups;
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
    font-size 92%
    padding 6px
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
    display block
    height calc(100vh - 170px)
    overflow auto
    position relative
</style>
