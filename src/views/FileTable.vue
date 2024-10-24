<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import VTable from '@/components/V-Table.vue'
import DownloadIcon from '@/components/icons/DownloadIcon.vue'
import mockFilesData from '@/assets/mock/mockFilesData.json'
import type { Column } from '@/interface/table'
import type { FileItem } from '@/interface/file'
import capitalize from '@/utils/capitalize'

const loading = ref(true) // reactive state for a primitive will trigger render on every change
const data = shallowRef<FileItem[]>([]) // shallowRef will trigger render only if root level instance has been overwritten
const totalRows = ref(0)
const selectedKeys = shallowRef<Set<string | number>>(new Set()) // pure copy of main Set from Table component to handle slot (yield) logic

/* define columns for table */
const columns: Column[] = [
  {
    prop: 'select',
    disabledRules: {
      // our highly reusable Table component make select checkbox for every row
      prop: 'status', // to create a specific behaviour we will use meta data for column
      value: new Set(['scheduled']), // it will keep our HTML structure easier, by cutting overhelming Slots (yields for Ember)
    },
  },
  {
    prop: 'name',
    label: 'Name',
    width: 160,
  },
  {
    prop: 'device',
    label: 'Device',
    width: 80,
  },
  {
    prop: 'path',
    label: 'Path',
    width: 420,
  },
  {
    prop: 'status',
    label: 'Status',
    width: 120,
    headerStyle: { 'padding-left': '24px' },
  },
]

/**
 * Function which simulates REST API request
 */
const fetchData = async () => {
  loading.value = true

  try {
    data.value = [] // clear data to simulate API fetching
  } catch (err) {
    console.error(err)
  } finally {
    /* let's simulate async condition for data fetching from API */
    setTimeout(() => {
      let totalAvailable = 0

      /* get Mock data instead of fetching and add IDs with O(n) */
      data.value = mockFilesData.map((file, $index) => {
        /* 
          count total rows in one traverse.
          according to behaviour of this table we can select only ready for download items,
          so our totalRow prop for selection count will be different than just array.length
        */
        if (file.status === 'available') ++totalAvailable

        return {
          id: $index + 1,
          ...file,
        }
      })

      // upd reactive prop once to minimize re-renders
      totalRows.value = totalAvailable

      loading.value = false
    }, 1000)
  }
}

/**
 * Download input click trigger
 */
const downloadFiles = () => {
  if (!selectedKeys.value.size) return // edge case for empty selection

  let text = ''

  data.value.forEach(file => {
    // for every selected Item prepare an information for Alert box
    if (selectedKeys.value.has(file.id)) {
      text += `
        ____________________________________________
        Path: ${file.path} \n
        Device: ${file.device} \n
      `
    }
  })

  alert(text)
}

fetchData() // invoke immediately on component creation stage
</script>

<template>
  <section class="file-table-wrapper">
    <V-Table
      class="file-table"
      ariaLabel="Files Table"
      :loading="loading"
      :columns="columns"
      :data="data"
      selectable
      :totalRows="totalRows"
      @changeSelected="newSet => (selectedKeys = newSet)"
    >
      <template v-slot:group>
        <div class="download-button" @click="downloadFiles">
          <label for="download">
            <DownloadIcon
              :color="!selectedKeys.size ? 'var(--disabled-color)' : null"
            />
          </label>
          <input
            accesskey="s"
            aria-label="Download Selected"
            data-testid="download-files-button"
            class="accessible-focus"
            type="button"
            name="Download Selected"
            value="Download Selected"
            :disabled="!selectedKeys.size"
            tabindex="0"
            @keydown.enter="downloadFiles"
          />
        </div>
      </template>

      <template v-slot:status="{ row }">
        <div
          v-if="row.status === 'available'"
          style="display: flex"
          data-testid="status-slot"
        >
          <div class="success-circle" />
          <p style="margin-left: 8px" role="text">
            {{ capitalize(row.status) }}
          </p>
        </div>
        <div v-else data-testid="status-slot">
          <p style="margin-left: 24px" role="text">
            {{ capitalize(row.status) }}
          </p>
        </div>
      </template>
    </V-Table>
  </section>
</template>

<style scoped lang="scss">
.file-table-wrapper {
  width: 100%;
  height: 100%;
}

.success-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--success-color);
}

.download-button {
  display: flex;
  cursor: pointer;

  &:hover {
    input[type='button'] {
      &:not([disabled]) {
        color: var(--selected-color);
      }
    }
  }

  label {
    display: flex;
    align-items: center;
    cursor: inherit;

    svg[color] {
      cursor: not-allowed;
    }
  }

  input[type='button'] {
    background-color: transparent;
    border: none;
    font-size: 15px;
    cursor: inherit;

    &[disabled] {
      cursor: not-allowed;
      color: var(--disabled-color);
    }

    &:focus {
      color: var(--selected-color);
    }
  }
}
</style>
