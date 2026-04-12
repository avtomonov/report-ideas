<template>
  <q-layout view="hHh lpR fFf">
    <q-header v-if="isAuthorized" elevated class="engagement-header">
      <q-toolbar class="header-toolbar">
        <q-toolbar-title class="header-title">
          <q-icon name="analytics" size="md" class="q-mr-md" />
          Идеи отчетов
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div v-if="!isAuthorized" class="auth-screen">
        <q-card class="auth-card">
          <q-card-section>
            <q-input
              v-model="password"
              outlined
              bg-color="white"
              color="teal-8"
              input-class="text-center"
              autofocus
              type="password"
              placeholder="Пароль"
              @keyup.enter="authorize"
            />
          </q-card-section>

          <q-card-actions align="center">
            <q-btn class="auth-btn" unelevated label="Вход" @click="authorize" />
          </q-card-actions>
        </q-card>
      </div>

      <template v-else>
        <ThemeTreeChart/>
        <ReportsDashboard />
      </template>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import ReportsDashboard from './components/ReportsDashboard.vue'

const FRONTEND_PASSWORD = 'demo'
const AUTH_COOKIE_NAME = 'report_ideas_auth'

const hasAuthCookie = () => {
  if (typeof document === 'undefined') return false
  const needle = `${AUTH_COOKIE_NAME}=1`
  return document.cookie.split(';').some(chunk => chunk.trim() === needle)
}

const setAuthCookie = () => {
  if (typeof document === 'undefined') return
  document.cookie = `${AUTH_COOKIE_NAME}=1; Max-Age=${60 * 60 * 24 * 30}; Path=/; SameSite=Lax`
}

const password = ref('')
const authError = ref(false)
const isAuthorized = ref(hasAuthCookie())

const authorize = () => {
  if (password.value === FRONTEND_PASSWORD) {
    setAuthCookie()
    isAuthorized.value = true
    authError.value = false
    return
  }

  authError.value = true
}
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

.auth-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #d9e4f5 100%);
}

.auth-card {
  width: min(420px, 100%);
  border-radius: 18px;
  padding: 10px;
}

.auth-btn {
  width: 100%;
  max-width: 320px;
  height: 46px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  color: #ffffff;
  background: linear-gradient(135deg, #0f766e 0%, #22c55e 100%);
}
</style>
 