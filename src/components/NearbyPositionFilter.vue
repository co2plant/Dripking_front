<template>
  <section class="max-w-5xl mx-auto px-4 mb-8">
    <div class="bg-zinc-50 rounded-lg p-4 md:p-5 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 md:items-end">
        <div>
          <label for="nearby-latitude" class="block text-xs md:text-sm text-zinc-600 mb-1">위도</label>
          <input
            id="nearby-latitude"
            v-model="latitude"
            type="number"
            min="-90"
            max="90"
            step="0.000001"
            class="w-full h-11 px-3 rounded-lg border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none text-sm md:text-base"
          />
        </div>
        <div>
          <label for="nearby-longitude" class="block text-xs md:text-sm text-zinc-600 mb-1">경도</label>
          <input
            id="nearby-longitude"
            v-model="longitude"
            type="number"
            min="-180"
            max="180"
            step="0.000001"
            class="w-full h-11 px-3 rounded-lg border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none text-sm md:text-base"
          />
        </div>
        <div>
          <label for="nearby-radius" class="block text-xs md:text-sm text-zinc-600 mb-1">반경 km</label>
          <input
            id="nearby-radius"
            v-model="radiusKm"
            type="number"
            min="1"
            max="500"
            step="1"
            class="w-full h-11 px-3 rounded-lg border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none text-sm md:text-base"
          />
        </div>
        <div class="flex gap-2 md:justify-end">
          <button
            type="button"
            class="h-11 w-11 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:border-amber-400 hover:text-zinc-900 flex items-center justify-center"
            title="현재 위치"
            @click="useCurrentPosition"
          >
            <crosshair-icon class="w-5 h-5" />
          </button>
          <button
            type="button"
            class="h-11 w-11 rounded-lg bg-amber-400 text-zinc-900 hover:bg-amber-500 flex items-center justify-center"
            title="검색"
            @click="applyBounds"
          >
            <search-icon class="w-5 h-5" />
          </button>
          <button
            type="button"
            class="h-11 w-11 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 flex items-center justify-center"
            title="초기화"
            @click="clearBounds"
          >
            <x-icon class="w-5 h-5" />
          </button>
        </div>
      </div>
      <p v-if="errorMessage" class="mt-3 text-sm text-red-600">{{ errorMessage }}</p>
    </div>
  </section>
</template>

<script setup>
import {defineEmits, ref} from 'vue';
import {Crosshair as CrosshairIcon, Search as SearchIcon, X as XIcon} from 'lucide-vue-next';
import {getCoordinateBoundsFromCenter} from "@/utils/coordinates";

const emit = defineEmits(['update-coordinate-bounds']);

const latitude = ref('');
const longitude = ref('');
const radiusKm = ref(30);
const errorMessage = ref('');

const applyBounds = () => {
  const bounds = getCoordinateBoundsFromCenter({
    latitude: latitude.value,
    longitude: longitude.value,
    radiusKm: radiusKm.value,
  });

  if (bounds === null) {
    errorMessage.value = '좌표 또는 반경을 확인해주세요.';
    emit('update-coordinate-bounds', null);
    return;
  }

  errorMessage.value = '';
  emit('update-coordinate-bounds', bounds);
};

const clearBounds = () => {
  errorMessage.value = '';
  latitude.value = '';
  longitude.value = '';
  radiusKm.value = 30;
  emit('update-coordinate-bounds', null);
};

const useCurrentPosition = () => {
  if (!navigator.geolocation) {
    errorMessage.value = '현재 위치를 사용할 수 없습니다.';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude.value = position.coords.latitude.toFixed(6);
      longitude.value = position.coords.longitude.toFixed(6);
      applyBounds();
    },
    () => {
      errorMessage.value = '현재 위치를 가져오지 못했습니다.';
    }
  );
};
</script>
