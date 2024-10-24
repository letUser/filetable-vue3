import { describe, it, expect, expectTypeOf, vi } from 'vitest'

import { mount, flushPromises } from '@vue/test-utils'

import FileTable from '@/views/FileTable.vue'
import VLoading from '@/directives/loading'
import VTable from '@/components/V-Table.vue'
import VTableControls from '@/components/V-Table-Controls.vue'

import type { Column } from '@/interface/table'

describe.concurrent('FileTable', async () => {
  it('renders properly', () => {
    const wrapper = mount(FileTable, {
      global: {
        directives: { // proxy custom directive
          'loading': VLoading
        }
      }
    })

    expect(wrapper.exists()).toBe(true) // check if FileTable.vue is rendered

    const section = wrapper.find('section')
    expect(section.exists()).toBe(true)
    expect(section.classes()).toContain('file-table-wrapper')

    const vTable = wrapper.findComponent(VTable) // check if VTable.vue is rendered
    expect(vTable.exists()).toBe(true)
    expect(vTable.classes()).toContain('file-table')

    const vTableControls = wrapper.findComponent(VTableControls) // check if VTableControls.vue is rendered
    expect(vTableControls.exists()).toBe(true)
    expect(vTableControls.classes()).toContain('v-table-controls')

    const selectAllCheckbox = vTableControls.find('[data-testid="select-all-checkbox"]') // check if Select All checkbox is rendered
    expect(selectAllCheckbox.exists()).toBe(true)
    expect(selectAllCheckbox.classes()).toContain('accessible-focus') // check accessibility class

    const bttn = vTableControls.find('[data-testid="download-files-button"]') // check if Download Button is rendered
    expect(bttn.exists()).toBe(true)
    expect(bttn.classes()).toContain('accessible-focus') // check accessibility class
  })

  it('child v-table component received proper props and types', () => {
    const wrapper = mount(FileTable, {
      global: {
        directives: { // proxy custom directive
          'loading': VLoading
        }
      }
    })

    const vTable = wrapper.findComponent(VTable)

    /*
      loading is required prop, so it will be false by default.
      at creation hook we set it to true when simulating data fetching. 
    */
    expectTypeOf(vTable.props('loading')).toEqualTypeOf<boolean>() // check that received prop has proper type
    expect(vTable.props('loading')).toBe(true)

    expectTypeOf(vTable.props('ariaLabel')).toEqualTypeOf<string | undefined>()
    expect(vTable.props('ariaLabel')).toBe('Files Table')

    /*
      v-table is highly reusable, we define columns by Column property.
      Columns could be changed all over the time, so we will check only types and length
      to ensure that we will provide correct data for Component.
      The correctnes also ensured by TypeScript during development.
    */
    expectTypeOf(vTable.props('columns')).toEqualTypeOf<Column[]>()
    expect(vTable.props('columns')).not.toHaveLength(0) // we need to provide at least one column to a higly reusable v-table

    /* 
      data is an Array of rows, it could be represented by any type,
      so we will check strict type in another test-case.
      checking the isArray type will suffice for now.
    */
    expect(vTable.props('data')).toBeInstanceOf(Array)
    expect(vTable.props('data')).toBeDefined()

    expectTypeOf(vTable.props('selectable')).toEqualTypeOf<boolean | undefined>()
    expect(vTable.props('selectable')).toBe(true)

    expectTypeOf(vTable.props('totalRows')).toEqualTypeOf<number | undefined>()
    expect(vTable.props('totalRows')).toBeDefined()
    expect(vTable.props('totalRows')).toBeGreaterThanOrEqual(0)
  })

  it('child v-table-controls component received proper props and types', () => {
    const wrapper = mount(FileTable, {
      global: {
        directives: { // proxy custom directive
          'loading': VLoading
        }
      }
    })

    const vTableControls = wrapper.findComponent(VTableControls)

    expect(vTableControls.attributes('aria-label')).toBe('Files Table Controls') // check aria-label attr

    expectTypeOf(vTableControls.props('selectable')).toEqualTypeOf<boolean | undefined>()
    expect(vTableControls.props('selectable')).toBe(true)

    expectTypeOf(vTableControls.props('selectedKeys')).toEqualTypeOf<Set<string | number> | undefined>()
    expect(vTableControls.props('selectedKeys')).toBeInstanceOf(Set)

    expectTypeOf(vTableControls.props('totalRows')).toEqualTypeOf<number | undefined>()
    expect(vTableControls.props('totalRows')).toBeDefined()
    expect(vTableControls.props('totalRows')).toBeGreaterThanOrEqual(0)
  })

  it('child v-table has "select" column', () => {
    const wrapper = mount(FileTable, {
      global: {
        directives: { // proxy custom directive
          'loading': VLoading
        }
      }
    })

    const selectCol = wrapper.find('[data-testid="table-header-select"')

    expect(selectCol.exists()).toBe(true)
  })

  it('loading statement changes during simulated fetching', async () => {
    const wrapper = mount(FileTable, {
      global: {
        directives: { // proxy custom directive
          'loading': VLoading
        }
      }
    })

    const vTable = wrapper.findComponent(VTable)

    /* immediately after mount stage during fetching data we check that loading element exists */
    expect(vTable.find('[data-testid="loading"]').exists()).toBe(true) // loading exists

    /*
      because we simulate a REST API fetching as a Promise,
      we will just use setTimeout instead of flushPromises() testing function or $nextTick behaviour
    */
    await new Promise(r => setTimeout(r, 1500))
    expect(vTable.find('[data-testid="loading"]').exists()).toBe(false) // loading removed
  })

  it('download button is only available if some items are selected', async () => {
    const wrapper = mount(FileTable, {
      global: {
        directives: { // proxy custom directive
          'loading': VLoading
        }
      }
    })

    const vTableControls = wrapper.findComponent(VTableControls)
    const bttn = vTableControls.find('[data-testid="download-files-button"]')
    const checkbox = vTableControls.find('[data-testid="select-all-checkbox"]')

    /*
      because we simulate a REST API fetching as a Promise,
      we will just use setTimeout instead of flushPromises() testing function or $nextTick behaviour
    */
    await new Promise(r => setTimeout(r, 1500))
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false) // loading removed

    expect(bttn.attributes().disabled).toBeDefined() // if disabled="false" it will be undefined here

    if (checkbox.attributes().disabled !== undefined) return true // edge case if nothing to select

    checkbox.trigger('click') // trigger select all checkbox
    await flushPromises() // waiting DOM re-render

    expect(bttn.attributes().disabled).not.toBeDefined() // check if not disabled anymore
  })

  it('"select all" checkbox has correct state according to numbers of selected items', async () => {
    const wrapper = mount(FileTable, {
      global: {
        directives: { // proxy custom directive
          'loading': VLoading
        }
      }
    })

    const vTableControls = wrapper.findComponent(VTableControls)
    const checkbox = vTableControls.find('[data-testid="select-all-checkbox"]')

    /*
      because we simulate a REST API fetching as a Promise,
      we will just use setTimeout instead of flushPromises() testing function or $nextTick behaviour
    */
    await new Promise(r => setTimeout(r, 1500))
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false) // check if data loaded

    expect(checkbox.attributes().checked).not.toBeDefined() // check if SelectAll is not checked

    if (checkbox.attributes().disabled !== undefined) return true // edge case if nothing to select

    checkbox.trigger('click') // trigger select all checkbox
    await flushPromises() // waiting DOM re-render

    expect(checkbox.attributes().checked).toBeDefined() // check if SelectAll is checked

    expect(checkbox.attributes('data-indeterminate')).toBe('false') // to be false

    /* get first non-disabled checkbox from v-table */
    const vTable = wrapper.findComponent(VTable)
    const rowCheckbox = vTable.find('input[name="select"]:not([disabled])')

    if (!rowCheckbox) return true // edge case if nothing to select

    rowCheckbox.trigger('click') // trigger row select checkbox
    await flushPromises() // waiting DOM re-render

    expect(rowCheckbox.attributes().checked).not.toBeDefined() // row select to be checked

    expect(checkbox.attributes('data-indeterminate')).toBe('true') // to be checked
  })

  it('input elements can be triggered by Enter key', async () => {
    const wrapper = mount(FileTable, {
      global: {
        directives: { // proxy custom directive
          'loading': VLoading
        }
      }
    })

    const vTableControls = wrapper.findComponent(VTableControls)
    const bttn = vTableControls.find('[data-testid="download-files-button"]')
    const checkbox = vTableControls.find('[data-testid="select-all-checkbox"]')

    /*
      because we simulate a REST API fetching as a Promise,
      we will just use setTimeout instead of flushPromises() testing function or $nextTick behaviour
    */
    await new Promise(r => setTimeout(r, 1500))
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false) // check if data loaded

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { })

    if (checkbox.attributes().disabled !== undefined) return true // edge case if nothing to select

    const vTable = wrapper.findComponent(VTable)
    const rowCheckbox = vTable.find('input[name="select"]:not([disabled])')

    rowCheckbox.trigger('keydown', { key: 'enter' }) // trigger press Enter event
    await flushPromises() // waiting DOM re-render

    expect(rowCheckbox.attributes().checked).toBeDefined() // row select to be checked

    checkbox.trigger('keydown', { key: 'enter' }) // trigger press Enter event
    await flushPromises() // waiting DOM re-render

    expect(checkbox.attributes().checked).toBeDefined() // row select to be checked

    expect(bttn.attributes().disabled).not.toBeDefined() // check if button is not disabled

    bttn.trigger('keydown', { key: 'enter' }) // trigger press Enter event
    await flushPromises() // waiting DOM re-render

    expect(alertSpy).toHaveBeenCalled()
    vi.restoreAllMocks() // clear mock to prevent side effects
  })

  it('has accessibility classes on input elements', async () => {
    const wrapper = mount(FileTable, {
      global: {
        directives: { // proxy custom directive
          'loading': VLoading
        }
      }
    })

    const items = wrapper.findAll('input')

    /*
      because we simulate a REST API fetching as a Promise,
      we will just use setTimeout instead of flushPromises() testing function or $nextTick behaviour
    */
    await new Promise(r => setTimeout(r, 1500))
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false) // check if data loaded

    items.forEach(input => {
      expect(input.classes()).toContain('accessible-focus')
    })
  })

  it('if empty data - show "No Data" in v-table', async () => {
    const wrapper = mount(FileTable, {
      global: {
        directives: { // proxy custom directive
          'loading': VLoading
        }
      }
    })

    /*
      because we simulate a REST API fetching as a Promise,
      we will just use setTimeout instead of flushPromises() testing function or $nextTick behaviour
    */
    await new Promise(r => setTimeout(r, 1500))
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false) // loading removed

    const vTable = wrapper.findComponent(VTable)
    const rows = vTable.findAll('tr')
    const p = vTable.find('[data-testid="table-nodata"]')

    const bodyTr = rows.find(row => row.classes().find(className => className === 'v-table-body-row')) // max 3 iterations

    if (bodyTr !== undefined) return true // edge case if there are tbody rows in v-table

    expect(p.exists()).toBe(true)
    expect(p.text()).toBe('No Data')
  })

  it('status should be correctly formatted', async () => {
    const wrapper = mount(FileTable, {
      global: {
        directives: { // proxy custom directive
          'loading': VLoading
        }
      }
    })

    /*
      because we simulate a REST API fetching as a Promise,
      we will just use setTimeout instead of flushPromises() testing function or $nextTick behaviour
    */
    await new Promise(r => setTimeout(r, 1500))
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false) // loading removed

    const vTable = wrapper.findComponent(VTable)
    const rows = vTable.findAll('[data-testid="status-slot"]')

    rows.filter(row => row.text() === 'Available')
      .forEach(row => expect(row.find('.success-circle').exists()).toBe(true))
  })
})

describe('Alert box', () => {
  it('is opened by pressing a download button', async () => {
    const wrapper = mount(FileTable, {
      global: {
        directives: { // proxy custom directive
          'loading': VLoading
        }
      }
    })

    const vTableControls = wrapper.findComponent(VTableControls)
    const bttn = vTableControls.find('[data-testid="download-files-button"]')
    const checkbox = vTableControls.find('[data-testid="select-all-checkbox"]')

    /*
      because we simulate a REST API fetching as a Promise,
      we will just use setTimeout instead of flushPromises() testing function or $nextTick behaviour
    */
    await new Promise(r => setTimeout(r, 1500))
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false) // loading removed

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { })

    if (checkbox.attributes().disabled !== undefined) return true // edge case if nothing to select

    checkbox.trigger('click') // trigger select all checkbox
    await flushPromises() // waiting DOM re-render

    expect(bttn.attributes().disabled).not.toBeDefined() // check if not disabled anymore

    bttn.trigger('click') // trigger button
    await flushPromises() // waiting DOM re-render

    expect(alertSpy).toHaveBeenCalled()
    vi.restoreAllMocks() // clear mock to prevent side effects
  })
})
