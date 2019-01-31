<template lang="pug">
  #app
    .server-list(v-if="currentServer === null")
      h1 Rails Log Viewer
      .rails-list
        rails-info(
          v-for="server in serverList"
          :key="server.pid"
          :server="server"
          @click="onClickServer"
        )
    main(v-else)
      rails-info(:server="currentServer" @click="clearServer")
      log-viewer(:logs="logs" :folder="currentServer.path")
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

import RailsInfo from './components/RailsInfo';
import LogViewer from './components/LogViewer';

export default {
  name: 'app',
  components: { RailsInfo, LogViewer },
  computed: {
    ...mapState(['logs']),
    ...mapGetters(['serverList', 'currentServer']),
  },
  methods: {
    ...mapActions(['commitUpdate']),

    onClickServer({ pid: rid }) {
      this.commitUpdate({ name: 'selectServer', rid });
    },

    clearServer() {
      this.commitUpdate({ name: 'selectServer', rid: null });
    },
  },
};
</script>

<style lang="stylus">
@font-face
  font-family "Fira Code"
  src: url("../assets/FiraCode-Regular.woff2") format("woff2")
*
  box-sizing border-box
p, pre
  margin 8px 0
body
  margin 0
  padding 0
  overflow-x auto
  overflow-y hidden
#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  color #2c3e50
  margin 10px auto
  width 1360px
  display block
  position relative
  height calc(100vh - 20px)
  overflow hidden
pre, code
  font-family 'Fira Code', monospace
  font-variant-ligatures contextual
a[href]
  text-decoration none
  color #07a
  &:visited
    color #07a
  &.file, &.file:visited
    color #c7254e

.rails-list
  padding: 5px 15px
  border-radius 10px
  background-color #EEE

main
  display flex
  flex-direction column
  height 100%
  font-size 11pt

h3
  margin 12px 0 6px 0
h4
  margin 10px 0 5px 0
.status-200
  color darkgreen
.status-400, .status-500
  color red
</style>
