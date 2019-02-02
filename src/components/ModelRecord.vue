<template lang="pug">
  .model-record
    | {{ model }}
    | {{ groups.length }} places ({{ recordCount }} records, {{ time }}ms)
</template>

<script>
import FileLink from './FileLink';
import { generateStack } from '../utils';

export default {
  name: 'ModelRecord',
  props: ['groups', 'model', 'time', 'count', 'recordCount', 'sqlCount', 'folder'],
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
.model-record
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
