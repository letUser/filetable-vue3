<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <header class="header fancy-bg" />

  <main class="main" aria-label="main">
    <RouterView />
  </main>

  <footer class="footer fancy-bg" />
</template>

<style scoped lang="scss">
.header {
  height: var(--header-height);
}

.main {
  display: flex;
  justify-content: center;
  padding: 4vh 2vw;
  height: calc(100vh - (var(--header-height) + var(--footer-height)));
}

.footer {
  height: var(--footer-height);
}

@media screen and (max-height: 770px) {
  .main {
    height: calc(100vh - var(--header-height));
  }

  .footer {
    display: none;
  }
}
</style>
