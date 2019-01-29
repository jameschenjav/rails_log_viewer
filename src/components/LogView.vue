<template lang="pug">
  .log-view
    .view(v-for="(view, index) in views.slice(0, 100)" :key="index") {{ view }}
</template>

<script>
export default {
  name: 'LogView',
  props: ['views'],
  computed: {
  },
};
</script>

<style lang="stylus">
.log-view
  padding-left 10px
  max-height 50vh
  overflow auto
  white-space pre-wrap
</style>
