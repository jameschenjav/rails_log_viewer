<template lang="pug">
  .log-model
    .sql(v-for="(sql, index) in models" :key="index")
      vue-json-pretty(:data="sql" :deep="2" show-length)
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
  name: 'LogModel',
  props: ['models', 'raw'],
  components: { VueJsonPretty },

  computed: {
  },
};
</script>

<style lang="stylus">
.log-model
  padding-left 10px
  max-height 100%
  overflow auto
  white-space pre-wrap
</style>
