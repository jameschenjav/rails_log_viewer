<template lang="pug">
  #app
    pre
      | Test 1 !== 2
</template>

<script>
export default {
  name: 'app',
};
</script>

<style lang="stylus">
@font-face
  font-family "Fira Code"
  src: url("../assets/FiraCode-Regular.woff2") format("woff2")
#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50
  margin-top 60px
pre, code
  font-family 'Fira Code', monospace
  font-variant-ligatures contextual
</style>
