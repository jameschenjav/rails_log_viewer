<template lang="pug">
  .log-model
    a(href="#" @click.prevent="showModels = !showModels")
      h3 [{{ showModels ? '-' : '+' }}] {{ models.length }} Models
    .models(v-if="showModels")
      model-record(v-for="(m, i) in orderedModels" :key="m.model" v-bind="m" :folder="folder")
    a(href="#" @click.prevent="showSqls = !showSqls")
      h3 [{{ showSqls ? '-' : '+' }}] {{ raw.length }} SQLs
    .sqls(v-if="showSqls")
      sql-record(v-for="(s, i) in raw" :key="i + 1" v-bind="s" :folder="folder" :index="i")
</template>

<script>
import sortBy from 'lodash/sortBy';

import ModelRecord from './ModelRecord';
import SqlRecord from './SqlRecord';

export default {
  name: 'LogModel',
  props: ['models', 'raw', 'folder'],
  components: { ModelRecord, SqlRecord },

  data: () => ({ showModels: true, showSqls: true }),

  computed: {
    orderedModels() {
      return sortBy(this.models, 'model');
    },
  },
};
</script>

<style lang="stylus">
.log-model
  padding 10px
</style>
