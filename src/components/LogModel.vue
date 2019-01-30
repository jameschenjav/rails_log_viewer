<template lang="pug">
  .log-model
    .sql(v-for="(sql, index) in orm.slice(0, 100)" :key="index") {{ sql }}
</template>

<script>
export default {
  name: 'LogModel',
  props: ['orm'],
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
