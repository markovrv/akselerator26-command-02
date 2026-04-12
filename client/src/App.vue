<template>
  <div id="app">
    <MainNav />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import MainNav from '@/components/MainNav.vue'
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #0f172a;
  background-color: #f8fafc;
}

#app {
  min-height: 100vh;
}
</style>
