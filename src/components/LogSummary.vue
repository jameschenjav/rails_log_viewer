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
        file-link(v-for="(r, i) in errorStack" :key="i + 1" v-bind="{ ...r, index: i }")
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

import FileLink from './FileLink';
import { generateStack } from '../utils';

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
      const { error: { backtrace: stack } = {} } = this;
      if (!stack) return null;

      return generateStack({ stack, folder: this.fullStack ? null : this.folder });
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
  .file-link
    margin 5px
.vjs__tree .vjs__tree__content
  padding-left 30px !important
</style>
