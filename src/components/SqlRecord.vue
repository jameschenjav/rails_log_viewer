<template lang="pug">
  .sql-record
    .sql [{{ index }}] {{ statement ? `(${statement})` : '' }} {{ sql }}
    .binds(v-if="binds.length")
      a(href="#" @click.prevent="showBinds = !showBinds")
        | [{{ showBinds ? '-' : '+' }}] {{ binds.length }} Binds:
      |  [
      .open(v-if="showBinds")
        .bind(v-for="(pair, i) in binds" :key="`b.${i}`")
          .key {{ pair[0] }}
          .value {{ pair[1] }}
      .close(v-else) ...
      | ]
    .result {{ name }} ({{ count }} calls in {{ time }}ms)
    a.handler(href="#" @click.prevent="showStack = !showStack")
      | [{{ showStack ? '-' : '+' }}] Backtrace ({{ callStack.length }} calls)
    .stack(v-if="showStack")
      file-link(v-for="(r, i) in callStack" :key="`c.${i}`" v-bind="{ ...r, index: i }")
</template>

<script>
import FileLink from './FileLink';
import { generateStack } from '../utils';

export default {
  name: 'SqlRecord',
  props: ['binds', 'sql', 'time', 'count', 'name', 'stack', 'statement', 'folder', 'index'],
  components: { FileLink },

  data: () => ({ showBinds: false, showStack: false }),

  computed: {
    callStack() {
      const { stack, folder } = this;
      return generateStack({ stack, folder, partial: true });
    },
  },
};
</script>

<style lang="stylus">
.sql-record
  margin 10px 5px
  .sql
    display block
  .result
    display block
    padding-left 30px
  .binds
    padding 10px 30px
    border-radius 8px
    .close
      display inline
      color #888
    .bind
      padding-left 30px
      *
        display inline-block
    .key:after
        content ': '
        padding-right 10px
  .handler
    padding-left 30px
  .stack
    margin 5px
    padding 10px 15px
    border-radius 8px
    background-color #EEE
    .file-link
      margin-bottom 5px
</style>
