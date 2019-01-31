<template lang="pug">
  .log-summary
    | Controller: {{ controller }}
    | Action: {{ action }}, format: {{ format }} (response: {{ response }})
    pre
      a.file(:href="sourceUrl")
        | [{{ controllerClass }}\#{{ action }}]
      .source-path {{ source.sourcePath }}
    .params
      h3 Params ({{ paramsKeyCount }} keys)
      vue-json-pretty(:data="params" :deep="2" show-length v-if="paramsKeyCount")
    .error(v-if="error")
      h3 {{ errorSummary }}
      | {{ error.original }} ({{ error.message }})
      br
      a(href="#" @click.prevent="fullStack = !fullStack")
        | {{ fullStack ? 'App Folder Only' : 'Full Stack' }}
      .call-stack
        file-link(v-for="(r, index) in errorStack" :key="index" v-bind="{ ...r, index }")
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

import FileLink from './FileLink';

const RE_ERROR = /^(.+?):in `(.+)'$/;

const generateStack = ({ backtrace, folder }) => {
  if (folder) {
    const chop = folder.length + 1;
    return backtrace.filter(msg => msg.startsWith(folder)).map((msg) => {
      const m = msg.match(RE_ERROR);
      const path = m[1];
      return {
        path,
        display: path.slice(chop),
        context: m[2],
      };
    });
  }

  return backtrace.map((msg) => {
    const m = msg.match(RE_ERROR);
    const path = m[1];
    return {
      path,
      display: path,
      context: m[2],
    };
  });
};

const SPREAD_PROP = [
  'controllerClass',
  'controller',
  'action',
  'format',
  'response',
  'folder',
];

export default {
  name: 'LogSummary',
  props: ['source', 'params', 'error'],
  components: { VueJsonPretty, FileLink },

  data: () => ({ fullStack: false }),

  computed: {
    ...SPREAD_PROP.reduce((fns, name) => ({
      ...fns,
      [name]() {
        return this.source[name];
      },
    }), {}),

    paramsKeyCount() {
      return Object.keys(this.params).length;
    },

    sourceUrl() {
      const { source: { sourcePath } } = this;
      return sourcePath && `vscode://file/${sourcePath}`;
    },

    errorStack() {
      const { error: { backtrace } = {} } = this;
      if (!backtrace) return null;

      return generateStack({ backtrace, folder: this.fullStack ? null : this.folder });
    },

    errorSummary() {
      const { error: { type }, fullStack, errorStack } = this;
      return `${type} (${fullStack ? 'Total' : 'App'}: ${errorStack.length} calls)`;
    },
  },
};
</script>

<style lang="stylus">
.log-summary
  padding 8px 12px 5px 12px
  .error h3
    color red
.vjs__tree .vjs__tree__content
  padding-left 30px !important
</style>
