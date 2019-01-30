<template lang="pug">
  .log-viewer
    .request-list
      .request-item(v-for="r in requests" :key="r.id" :class="{ selected: r.id === selectedId }")
        a(
          :href="`/?url=${r.path}`"
          @click.prevent="onSelectRequest(r.log)"
          :title="r.log.path"
        )
          .method(:class="`status-${r.status[0]}00`")
            | [{{ r.log.method }}]
            .small {{ r.status }}
          .path {{ r.shortenPath }}
          pre.timestamp
            | {{ r.timestamp }}
            | [{{ r.timespan }} ms]
    request-panel(v-if="request" :log="request")
</template>

<script>
import format from 'date-fns/format';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';

import RequestPanel from './RequestPanel';
import { mapStackUrl } from '../utils';

const extractPath = (path) => {
  const q = path.indexOf('?');
  return q > 0 ? path.slice(0, q) : path;
};

const shortenPath = (path) => {
  const p = extractPath(path);

  if (p.length <= 30) return p;
  const parts = p.split('/');
  const last = parts[parts.length - 1];
  const s = `${parts[1]}/.../${last}`;
  return s.length <= 30 ? s : `.../${last}`;
};

export default {
  name: 'LogViewer',
  props: ['logs'],
  components: { RequestPanel },

  data: () => ({ request: null }),

  computed: {
    requests() {
      const { logs } = this;
      return logs.map(({ orm, view, ...log }) => ({
        id: log.id,
        path: extractPath(log.path),
        shortenPath: shortenPath(log.path),
        log: {
          ...log,
          orm: orm.map(mapStackUrl),
          view: view.map(mapStackUrl),
        },
        status: (log.status || 500).toString(),
        timestamp: format(log.started, 'MM-DD HH:mm:ss'),
        timespan: differenceInMilliseconds(log.finished, log.started),
      }));
    },

    selectedId() {
      const { request } = this;
      return request && request.id;
    },
  },

  methods: {
    onSelectRequest(request) {
      this.request = request;
    },
  },
};
</script>

<style lang="stylus">
.log-viewer
  flex 1
  display flex
  flex-direction row
  align-items stretch
  margin-bottom 10px
  .request-list
    flex 1
    width 30%
    max-width 400px
    overflow-x hidden
    overflow-y auto
    background-color #CCC
    padding 5px 0
    .request-item
      padding: 3px
      width 100%
      &.selected
        background-color #EEE
      &:hover
        background-color #EED
      a
        display inline-flex
        align-items center
        width 100%
        height 35px
        position relative
        padding-left 5px
        &:hover .timestamp
          display none
    .method
      display inline-block
      line-height 1.2
      font-size 70%
      vertical-align middle
      color #222
      width 32px
      .small
        font-size 90%
    .status-200
      color darkgreen
    .status-400, .status-500
      color red
    .path
      font-size 10pt
      padding-left 5px
      display inline-block
      font-family 'Fira Code', monospace
      vertical-align middle
      width calc(100% - 40px)
    .timestamp
      font-size 70%
      font-weight bold
      line-height 1.1
      position absolute
      padding 3px
      margin 0
      top 2px
      right 0
      background-color rgba(0, 0, 0, 0.6)
      color #EEE
      text-align right
</style>
