<template lang="pug">
  .log-viewer
    .request-list
      .request-item(v-for="r in requests" :key="r.id" :class="{ selected: r.id === selectedId }")
        a(:href="`/request?id=${r.id}`" @click.prevent="onSelectRequest(r)" :title="r.path")
          .method {{ r.method }}
          .path {{ r.path }}
          .timestamp {{ r.timestamp }}
    .request-detail(v-if="request")
      pre {{ request.path }}
      .tab Summary
      .tab Params
      .tab Models
      .tab View
      .tab Error
</template>

<script>
import format from 'date-fns/format';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';

export default {
  name: 'LogViewer',
  props: ['logs'],
  data: () => ({ request: null }),

  computed: {
    requests() {
      const { logs } = this;
      return logs.map(({
        id, method, path, started, finished, ...log
      }) => ({
        id,
        method,
        path,
        timestamp: format(started, 'MM-DD HH:mm:ss.SSS'),
        timespan: differenceInMilliseconds(started, finished),
        ...log,
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
    width 30%
    max-width 400px
    overflow-x hidden
    overflow-y auto
    background-color #EEE
    padding 5px 0
    .request-item
      padding: 3px
      width 100%
      &.selected
        background-color #DEF
      &:hover
        background-color #CCC
      a
        display inline-block
        width 100%
        position relative
        white-space nowrap
        line-height 2
        padding-left 5px
    .method
      display inline-block
      font-size 70%
      vertical-align middle
      color rgba(0, 0, 0, 0.6)
    .path
      padding-left 5px
      display inline-block
      font-family 'Fira Code', monospace
      vertical-align middle
    .timestamp
      font-size 70%
      font-weight bold
      padding 1px 3px
      position absolute
      top 10px
      right 0
      background-color #444
      color #EEE
  .request-detail
    flex 1
    padding 0 10px
</style>
