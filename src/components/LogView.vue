<template lang="pug">
  .log-view
    view-record(v-for="(v, i) in views" :key="i+1" v-bind="v" :folder="folder" :index="i")
</template>

<script>
import ViewRecord from './ViewRecord';

export default {
  name: 'LogView',
  props: ['views', 'folder'],
  components: { ViewRecord },
};
</script>

<style lang="stylus">
.log-view
  padding-left 10px
  max-height 100%
  overflow auto
  white-space pre-wrap
</style>
