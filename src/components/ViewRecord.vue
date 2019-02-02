<template lang="pug">
  .view-record
    | [{{ index }}] {{ event }} ({{ count > 1 ? `${count} times in ` : '' }}{{ time }}ms)
    .path
      a.handler(href="#" @click.prevent="showStack = !showStack")
        | [{{ showStack ? '-' : '+' }}] ({{ callStack.length }})
      file-link(:display="path" :path="`${folder}/${path}`")
    .stack(v-if="showStack")
      file-link(v-for="(r, i) in callStack" :key="i + 1" v-bind="{ ...r, index: i }")
</template>

<script>
import FileLink from './FileLink';
import { generateStack } from '../utils';

export default {
  name: 'ViewRecord',
  props: ['path', 'event', 'time', 'folder', 'stack', 'count', 'index'],
  components: { FileLink },

  data: () => ({ showStack: false }),

  computed: {
    callStack() {
      const { stack, folder } = this;
      return generateStack({ stack, folder, partial: true });
    },
  },
};
</script>

<style lang="stylus">
.view-record
  margin 10px 5px
  .path
    .handler
      margin-right 10px
    & > *
      display inline-block
  .stack
    margin 5px
    padding 10px 15px
    border-radius 8px
    background-color #EEE
    .file-link
      margin-bottom 5px
</style>
