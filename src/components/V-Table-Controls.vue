<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  selectable?: boolean
  selectedKeys?: Set<string | number>
  totalRows?: number
}>()

const emit = defineEmits<{
  selectAll: [boolean]
}>()

const selectAllLabel = ref('Select All') // default label
const selectAllState = ref(false)
const selectAllInterState = ref(false) // we will store curr indeterminate state of "select all" input as a dataset prop for testing

/* create Watcher only if selectedKeys exists */
if (props.selectedKeys) {
  watch(
    () => props.selectedKeys?.size,
    length => {
      if (!length || length < 1) {
        selectAllLabel.value = 'None Selected'
        selectAllState.value = false
        selectAllInterState.value = false
      } else {
        selectAllLabel.value = `Selected ${length}`

        /* if selected All rows */
        if (length === props.totalRows) {
          selectAllState.value = true
          selectAllInterState.value = false
        } else {
          selectAllInterState.value = true
        }
      }
    },
    {
      immediate: true, // invoked on a creation stage firstly
    },
  )
}

/* computed property to define selectAll disable behaviour */
const isSelectAllDisabled = computed(() => {
  return props.totalRows === undefined ? false : props.totalRows < 1
})

/**
 * Select All event handler
 */
const toggleSelectAll = () => {
  selectAllState.value = !selectAllState.value
  emit('selectAll', selectAllState.value)
}
</script>

<template>
  <div class="v-table-controls">
    <div class="v-table-controls-group">
      <slot name="group"></slot>
    </div>

    <div v-if="props.selectable" class="v-table-controls-select">
      <input
        accesskey="a"
        aria-label="Select All"
        :aria-checked="selectAllState"
        type="checkbox"
        id="select-all-checkbox"
        class="accessible-focus"
        name="selectAll"
        :checked="selectAllState"
        :indeterminate="selectAllInterState"
        :data-indeterminate="selectAllInterState"
        @click="toggleSelectAll"
        @keydown.enter="toggleSelectAll"
        data-testid="select-all-checkbox"
        :disabled="isSelectAllDisabled"
      />
      <label for="select-all-checkbox" :disabled="isSelectAllDisabled">{{
        selectAllLabel
      }}</label>
    </div>
  </div>
</template>

<style scoped lang="scss">
.v-table-controls {
  padding: 12px 48px;
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;

  &-group {
    display: flex;
    align-items: center;
  }

  &-select {
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    font-size: 18px;

    &:hover {
      color: var(--selected-color);
    }

    input[type='checkbox'] {
      cursor: inherit;
      width: var(--accessible-size);
      height: var(--accessible-size);

      &[disabled] {
        cursor: not-allowed;
        color: var(--disabled-color);
      }
    }

    label {
      cursor: inherit;
      margin-left: 12px;

      &[disabled='true'] {
        cursor: not-allowed;
        color: var(--disabled-color);
      }
    }
  }

  @media screen and (max-width: 440px) {
    padding: 12px;

    &-select {
      font-size: 15px;
    }
  }
}
</style>
