<template lang="pug">
  .log-viewer
    .request-list(:class="hasRequest ? 'short' : ''")
      .request-item(v-for="r in requests" :key="r.id" :class="{ selected: r.id === selectedId }")
        a(:href="`#${r.path}`" :title="r.log.path" @click.prevent="onSelectRequest(r)")
          .method(:class="`status-${r.status[0]}00`")
            | {{ r.log.method }}
            .small {{ r.status }}
          .path {{ r.displayPath || r.path }}
          pre.timestamp
            | {{ r.timestamp }}
            | [{{ r.timespan }} ms]
    request-panel(v-if="request" :log="request" :folder="folder")
</template>

<script>
import format from 'date-fns/format';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';

import RequestPanel from './RequestPanel';

const extractPath = (path) => {
  const q = path.indexOf('?');
  return q > 0 ? path.slice(0, q) : path;
};

const MAX_PATH_SIZE = 32;

const shortenPath = (path) => {
  const p = extractPath(path);

  if (p.length < MAX_PATH_SIZE) return p;
  const parts = p.split('/');
  const last = parts[parts.length - 1];
  const s = `${parts[1]}/.../${last}`;
  return s.length < MAX_PATH_SIZE ? s : `.../${last}`;
};

export default {
  name: 'LogViewer',
  props: ['logs', 'folder'],
  components: { RequestPanel },

  data: () => ({ request: null }),

  computed: {
    hasRequest() {
      return !!this.request;
    },

    requests() {
      const { logs } = this;
      return logs.map(log => ({
        id: log.id,
        log,
        path: extractPath(log.path),
        displayPath: this.hasRequest ? shortenPath(log.path) : null,
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
    onSelectRequest({ log, timespan }) {
      const { request: req } = this;
      this.request = (req && req.id) === log.id ? null : { timespan, ...log };
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
  font-family 'Fira Code', monospace
  .request-list
    flex 1
    overflow-x hidden
    overflow-y auto
    background-color #CCC
    padding 5px 0
    &.short
      width 400px
      max-width 400px
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
    .method
      display inline-block
      line-height 1.2
      font-size 70%
      vertical-align middle
      width 32px
      .small
        font-size 90%
    .path
      font-size 10pt
      display inline-block
      vertical-align middle
      width calc(100% - 30px)
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
