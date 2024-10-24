<script setup lang="ts">
import { ref } from 'vue'
import VTableControls from '@/components/V-Table-Controls.vue'
import type { Column, SelectionDisableRules } from '@/interface/table'

const props = defineProps<{
  columns: Column[]
  loading: boolean
  selectable?: boolean
  totalRows?: number
  ariaLabel?: string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[] // component is highly reusable, so we can't specify a type
}>()

const emit = defineEmits<{
  changeSelected: [Set<string | number>]
}>()

const filterable = ref(false)
const pureColumns: Column[] = props.columns.map(i => i) // create copy of initial columns with O(n)
const selectedKeys = ref<Set<string | number>>(new Set()) // define Set of selected keys for O(1) access
const hlRowIndex = ref<number>(-1) // state for current highlighted row by index
let selectionRules: SelectionDisableRules | null = null

/**
 * Row selection handle
 * @param row line entity
 */
const selectRow = (row: { [key: string]: string }) => {
  if (selectionRules) {
    // edge case for disabled for selection row click
    if (selectionRules.value.has(row[selectionRules.prop])) return
  }

  const target = document.getElementById(
    `table-select-box-${row.id}`,
  ) as HTMLInputElement

  /* here Set structure works great */
  if (selectedKeys.value.has(row.id)) {
    selectedKeys.value.delete(row.id)
    if (target) {
      target.checked = false
      target.focus()
    }
  } else {
    selectedKeys.value.add(row.id)
    if (target) {
      target.checked = true
      target.focus()
    }
  }

  emit('changeSelected', selectedKeys.value)
}

/**
 * Handle Select All emited event
 * @param {boolean} selected is selected or deselected
 */
const emitedSelectAll = (selected: boolean) => {
  selectedKeys.value.clear()

  if (selected) {
    /* if there is specific disabled rules for checkbox, then check before add to selected */
    props.data.forEach(row => {
      if (selectionRules) {
        // O(1) because of Set
        if (!selectionRules.value.has(row[selectionRules.prop])) {
          selectedKeys.value.add(row.id)
        }
      } else {
        selectedKeys.value.add(row.id)
      }
    })
  }

  emit('changeSelected', selectedKeys.value)
}

/* defining behavior during component creation */
if (props.selectable) {
  const selection = pureColumns.find(column => column.prop === 'select') // check if there is select column already

  if (!selection)
    pureColumns.unshift({ prop: 'select' }) // mutate copy with column for selection
  else selectionRules = selection.disabledRules ?? null // otherwise keep rules for fast access
}
</script>

<template>
  <div class="v-table-wrapper-section">
    <V-Table-Controls
      :aria-label="`${props.ariaLabel ?? 'Table'} Controls`"
      :selectable="props.selectable"
      :selectedKeys="selectedKeys"
      :totalRows="props.totalRows ?? props.data.length"
      @selectAll="emitedSelectAll"
    >
      <template v-slot:group>
        <slot name="group"></slot>
      </template>
    </V-Table-Controls>

    <div
      class="v-table-wrapper table-focus"
      :aria-label="props.ariaLabel ?? 'Table'"
      tabindex="0"
    >
      <table
        class="v-table"
        :style="`height: ${props.loading ? '100%' : null}`"
      >
        <thead
          :class="{
            'v-table-header': true,
            __filterable: filterable,
          }"
        >
          <tr role="row">
            <th
              :aria-label="column.label ?? column.prop"
              role="columnheader"
              scope="col"
              v-for="column in pureColumns"
              :key="column.prop"
              class="v-table-header-column"
              :style="{
                ...column.headerStyle,
                'min-width': `${column.width ?? 64}px`,
              }"
              :data-testid="`table-header-${column.prop}`"
            >
              <h3>{{ column.label }}</h3>
            </th>
          </tr>
        </thead>
        <tbody
          v-loading="props.loading"
          :key="+props.loading"
          class="v-table-body"
        >
          <tr
            role="row"
            scope="col"
            v-for="(row, $index) in props.data"
            :key="row.id"
            :class="{
              'v-table-body-row': true,
              highlight: hlRowIndex === $index,
              selectable: props.selectable,
              __selected: selectedKeys.has(row.id),
            }"
            @click="selectRow(row)"
          >
            <td
              v-for="column in pureColumns"
              :key="column.prop"
              class="v-table-body-row-cell"
            >
              <div
                v-if="column.prop === 'select'"
                class="v-table-body-row-cell__select-wrapper"
              >
                <input
                  :aria-label="`select${$index}`"
                  :aria-checked="selectedKeys.has(row.id)"
                  type="checkbox"
                  :id="`table-select-box-${row.id}`"
                  class="v-table-body-row-cell__select accessible-focus"
                  name="select"
                  :disabled="
                    column.disabledRules
                      ? column.disabledRules.value.has(
                          row[column.disabledRules.prop],
                        )
                      : false
                  "
                  :checked="selectedKeys.has(row.id)"
                  @keydown.enter="selectRow(row)"
                  @focus="hlRowIndex = $index"
                />
              </div>
              <div
                v-else
                @click="
                  ($ev: Event) => {
                    $ev.preventDefault()
                    $ev.stopPropagation()
                  }
                "
                class="v-table-body-row-cell__text"
              >
                <slot :name="column.prop" :row="row">
                  <p role="text">{{ row[column.prop] }}</p>
                </slot>
              </div>
            </td>
          </tr>

          <tr v-if="!props.data.length">
            <td class="v-table-body-empty" :colspan="pureColumns.length">
              <p data-testid="table-nodata">No Data</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.v-table {
  width: 100%;
  border-collapse: collapse;

  &-wrapper {
    border: 2px solid var(--border-color);
    border-radius: 4px;
    height: inherit;
    outline: none;
    overflow: scroll;

    &-section {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  }

  &-header {
    outline: 2px solid var(--border-color);
    position: sticky;
    top: 0;
    background-color: var(--fill-color);

    &.__filterable {
      height: 96px;
    }

    &-column {
      text-align: left;

      h3 {
        padding: 12px 0;
      }
    }
  }

  &-body {
    overflow: scroll;

    &-row {
      border-bottom: 1px solid var(--border-color);

      &.selectable {
        cursor: pointer;

        &:hover,
        &.highlight {
          background-color: var(--hover-fill-color);
        }

        &.__selected {
          background-color: var(--selected-fill-color);
        }
      }

      &-cell {
        &__select {
          cursor: pointer;
          outline: none;
          width: var(--accessible-size);
          height: var(--accessible-size);

          &-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        &__text {
          cursor: text;
          width: fit-content;
          display: flex;
          height: 100%;
          align-items: center;
          padding: 18px 0;
        }
      }
    }

    &-empty {
      text-align: center;
      height: 100%;

      p {
        margin-top: 48px;
      }
    }
  }
}

.table-focus {
  &:focus-visible {
    outline: 3px solid var(--selected-color) !important;
    outline-offset: 1px !important;
  }
}
</style>
