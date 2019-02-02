<template lang="pug">
  .model-record
    .title
      .bold {{ model }}
      |  {{ recordCount }} records, {{ sqlCount }} SQLs ({{ time }}ms)
    .groups
      a(href="#" @click.prevent="showGroups = !showGroups")
        | [{{ showGroups ? '-' : '+' }}] {{ groups.length }} places
      |  [
      .open(v-if="showGroups")
        model-group(v-for="(g, i) in groups" v-bind="g" :key="i+1" :folder="folder" :index="i")
      .close(v-else) ...
      | ]
</template>

<script>
import ModelGroup from './ModelGroup';
import FileLink from './FileLink';
import { generateStack } from '../utils';

export default {
  name: 'ModelRecord',
  props: ['groups', 'model', 'time', 'count', 'recordCount', 'sqlCount', 'folder'],
  components: { FileLink, ModelGroup },

  data: () => ({ showGroups: false }),

  computed: {
    callStack() {
      const { stack, folder } = this;
      return generateStack({ stack, folder, partial: true });
    },
  },
};
</script>

<style lang="stylus">
.model-record
  margin 10px 5px
  .groups
    padding-left 12px
  .title
    display block
    .bold
      color green
      font-weight bold
      display inline
  .open
    display block
    padding-left 30px
  .close
    display inline
</style>
