import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import { routes } from "@/router"

import App from '@/App.vue'
import FileTable from '@/views/FileTable.vue'
import VLoading from '@/directives/loading'

/* create Router with real routes for tests */
const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

describe('App', () => {
  const wrapper = mount(App, {
    global: {
      plugins: [router],
      directives: { // proxy custom directive
        'loading': VLoading
      }
    }
  })

  it('renders properly with Router', () => {
    expect(wrapper.exists()).toBe(true) // check if App.vue is rendered

    /* check tags existance and proper classes */
    const header = wrapper.find('header')
    expect(header.exists()).toBe(true)
    expect(header.classes()).toContain('header')
    expect(header.classes()).toContain('fancy-bg')

    const main = wrapper.find('main')
    expect(main.exists()).toBe(true)
    expect(main.classes()).toContain('main')

    const footer = wrapper.find('footer')
    expect(footer.exists()).toBe(true)
    expect(footer.classes()).toContain('footer')
    expect(footer.classes()).toContain('fancy-bg')

    /* check if RouterView exists */
    const routerView = wrapper.findComponent(RouterView)
    expect(routerView.exists()).toBe(true)
  })

  it('routing /', async () => {
    router.push('/')
    await router.isReady()

    /* find the Component which assosiated with the route '/' */
    const fileTable = wrapper.findComponent(FileTable)
    expect(fileTable.exists()).toBe(true)
  })
})
