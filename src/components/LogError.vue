<template lang="pug">
  .log-error
    | {{ error }}
</template>

<script>
export default {
  name: 'LogError',
  props: ['error'],
  computed: {
  },
};
</script>

<style lang="stylus">
.log-error
  padding-left 10px
  max-height 50vh
  overflow auto
  white-space pre-wrap
</style>
