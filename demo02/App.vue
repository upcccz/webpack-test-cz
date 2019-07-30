<template>
  <h1>{{ msg }}</h1>
</template>

<script lang="ts">
  import Vue from "vue";

  // 通过 Vue.extend 启用 TypeScript 类型推断
  export default Vue.extend({
    data() {
      return {
        msg: 'Hello,Webpack',
      }
    },
  });
</script>

<style scoped>
  h1 {
    color: red;
  }
</style>