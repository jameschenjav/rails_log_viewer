<template lang="pug">
  .model-group
    | [{{ index }}] {{ count }} calls, {{ recordCount }} records ({{ time }}ms)
    .sql(v-if="sql.length")
      a.block(href="#" @click.prevent="showSqls = !showSqls")
        | [{{ showSqls ? '-' : '+' }}] {{ sql.length }} SQLs
      .block(v-if="showSqls")
        sql-record(v-for="(s, i) in sql" v-bind="s" :key="`s.${i}`" :folder="folder" :index="i")
    a.block(href="#" @click.prevent="showStack = !showStack")
      | [{{ showStack ? '-' : '+' }}] Backtrace ({{ callStack.length }} calls)
    .stack(v-if="showStack")
      file-link(v-for="(r, i) in callStack" :key="`c.${i}`" v-bind="{ ...r, index: i }")
</template>

<script>
import FileLink from './FileLink';
import SqlRecord from './SqlRecord';

import { generateStack } from '../utils';

export default {
  name: 'ModelGroup',
  props: ['sql', 'time', 'count', 'stack', 'recordCount', 'folder', 'index'],
  components: { FileLink, SqlRecord },

  data: () => ({ showSqls: false, showStack: false }),

  computed: {
    callStack() {
      const { stack, folder } = this;
      return generateStack({ stack, folder, partial: true });
    },
  },
};
</script>

<style lang="stylus">
.model-group
  margin 10px 5px
  .block
    display block
    margin-left 30px
  .stack
    margin 5px
    padding 10px 15px
    border-radius 8px
    background-color #EEE
    .file-link
      margin-bottom 5px
</style>
