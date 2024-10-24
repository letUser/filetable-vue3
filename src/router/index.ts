import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import FileTable from '@/views/FileTable.vue'

const routes: readonly RouteRecordRaw[] = [
  {
    path: '/',
    name: 'filetable',
    component: FileTable
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

export { routes }

export default router
