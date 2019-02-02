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
      log-model(:models="orm.models" :raw="orm.raw" :folder="folder" v-if="tab === 'models'")
</template>

<script>
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';

import LogSummary from './LogSummary';
import LogModel from './LogModel';
import LogView from './LogView';

import { groupViews, groupModels } from '../utils';

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

      return log ? groupViews(log.view.map(({
        event, started, finished, stack, identifier,
      }) => {
        const path = identifier.startsWith(folder) ? identifier.slice(chopLength) : identifier;
        return {
          path,
          stack,
          time: differenceInMilliseconds(finished, started),
          event: event.split('.')[0].replace('render_', ''),
        };
      })) : [];
    },

    orm() {
      const { log } = this;
      if (!log) return [];

      const models = {};
      const sql = [];
      log.orm.forEach(({
        class_name: model = null,
        event: evt,
        started,
        finished,
        statement_name: statement,
        connection_id: _cid,
        ...rec
      }) => {
        const time = differenceInMilliseconds(finished, started);
        if (!model) {
          sql.push({ time, statement, ...rec });
          return;
        }

        let m = models[model];
        if (!m) {
          m = { event: evt.split('.')[0], records: [] };
          models[model] = m;
        }
        m.records.push({ time, ...rec });
      });

      return groupModels({ models, sql });
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
