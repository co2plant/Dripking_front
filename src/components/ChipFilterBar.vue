<template>
  <div class="mb-8 border-y border-zinc-200 py-4">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0 flex-1">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <span class="text-sm font-semibold text-zinc-950">{{ label }}</span>
          <span class="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
            선택: {{ selectedLabel }}
          </span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
              v-if="showAllOption"
              type="button"
              :class="chipClass(allValue)"
              :aria-pressed="isSelected(allValue)"
              @click="selectValue(allValue)"
          >
            {{ allLabel }}
          </button>
          <button
              v-for="item in visibleItems"
              :key="itemValue(item)"
              type="button"
              :class="chipClass(itemValue(item))"
              :aria-pressed="isSelected(itemValue(item))"
              @click="selectValue(itemValue(item))"
          >
            {{ itemLabel(item) }}
          </button>
          <button
              v-if="shouldShowToggle"
              type="button"
              class="inline-flex h-9 items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30"
              @click="showAllItems = !showAllItems"
          >
            <ChevronUp v-if="showAllItems" class="h-4 w-4" aria-hidden="true" />
            <ChevronDown v-else class="h-4 w-4" aria-hidden="true" />
            {{ toggleLabel }}
          </button>
        </div>
      </div>
      <div v-if="$slots.action" class="shrink-0 lg:mt-7">
        <slot name="action" />
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, defineEmits, defineProps, ref} from 'vue'
import {ChevronDown, ChevronUp} from 'lucide-vue-next'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  selectedValue: {
    type: [Number, String],
    default: 0,
  },
  itemValueKey: {
    type: String,
    default: 'id',
  },
  itemLabelKey: {
    type: String,
    default: 'name',
  },
  allValue: {
    type: [Number, String],
    default: 0,
  },
  allLabel: {
    type: String,
    default: '전체',
  },
  showAllOption: {
    type: Boolean,
    default: true,
  },
  visibleLimit: {
    type: Number,
    default: 8,
  },
})

const emit = defineEmits(['update:selectedValue', 'select'])
const showAllItems = ref(false)

const valuesEqual = (left, right) => String(left) === String(right)
const itemValue = (item) => item?.[props.itemValueKey]
const itemLabel = (item) => item?.[props.itemLabelKey] || ''
const isSelected = (value) => valuesEqual(props.selectedValue, value)

const selectedItem = computed(() =>
    props.items.find((item) => valuesEqual(itemValue(item), props.selectedValue))
)

const selectedLabel = computed(() => {
  if (valuesEqual(props.selectedValue, props.allValue)) {
    return props.allLabel
  }

  return selectedItem.value ? itemLabel(selectedItem.value) : props.allLabel
})

const collapsedItems = computed(() => {
  const baseItems = props.items.slice(0, props.visibleLimit)
  if (valuesEqual(props.selectedValue, props.allValue)
      || baseItems.some((item) => valuesEqual(itemValue(item), props.selectedValue))) {
    return baseItems
  }

  return selectedItem.value ? [...baseItems, selectedItem.value] : baseItems
})

const visibleItems = computed(() => showAllItems.value ? props.items : collapsedItems.value)

const hiddenItemCount = computed(() => {
  const visibleValues = new Set(visibleItems.value.map((item) => String(itemValue(item))))
  return props.items.filter((item) => !visibleValues.has(String(itemValue(item)))).length
})

const shouldShowToggle = computed(() => showAllItems.value || hiddenItemCount.value > 0)
const toggleLabel = computed(() => showAllItems.value ? '접기' : `더보기 ${hiddenItemCount.value}`)

const chipClass = (value) => [
  'inline-flex h-9 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/30',
  isSelected(value)
      ? 'border-amber-400 bg-amber-400 text-zinc-950'
      : 'border-zinc-200 bg-white text-zinc-700 hover:border-amber-300 hover:bg-amber-50'
]

const selectValue = (value) => {
  emit('update:selectedValue', value)
  emit('select', value)
}
</script>
