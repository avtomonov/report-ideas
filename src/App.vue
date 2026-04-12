<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="engagement-header">
      <q-toolbar class="header-toolbar">
        <q-toolbar-title class="header-title">
          <q-icon name="analytics" size="md" class="q-mr-md" />
          Идеи отчетов
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <ThemeTreeChart/>
      <ReportsDashboard />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import ReportsDashboard from './components/ReportsDashboard.vue'
</script>

<style scoped lang="scss">
.engagement-header {
  background: linear-gradient(135deg, #61c13a 0%, rgb(98, 217, 0) 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);

  .header-toolbar {
    padding: 0 24px;
  }

  .header-title {
    font-size: 20px;
    font-weight: 600;
    color: white;
    display: flex;
    align-items: center;
  }
}

:deep(.q-page-sticky) {
  z-index: 1500;
}
</style>
 