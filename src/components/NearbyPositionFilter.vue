<template>
  <section class="max-w-5xl mx-auto px-4 mb-8">
    <div class="bg-zinc-50 rounded-lg p-4 md:p-5 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 md:items-end">
        <div>
          <p class="text-sm font-semibold text-zinc-950">현재 위치 확인</p>
          <p class="mt-1 text-sm text-zinc-600">
            위치 공유 후 이 여행의 국가 또는 일정 장소 주변인지 확인합니다.
          </p>
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
            class="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-zinc-900 hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
            title="현재 위치"
            :disabled="isResolving"
            @click="useCurrentPosition"
          >
            <crosshair-icon class="w-5 h-5" />
            {{ isResolving ? '확인 중' : '현재 위치 공유' }}
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
      <p v-if="positionMessage" class="mt-3 text-sm text-zinc-600">{{ positionMessage }}</p>
      <p v-if="errorMessage" class="mt-3 text-sm text-red-600">{{ errorMessage }}</p>
    </div>
  </section>
</template>

<script setup>
import {defineEmits, ref} from 'vue';
import {Crosshair as CrosshairIcon, X as XIcon} from 'lucide-vue-next';
import {getCoordinateBoundsFromCenter} from "@/utils/coordinates";

const emit = defineEmits(['location-selected', 'location-cleared']);

const radiusKm = ref(30);
const errorMessage = ref('');
const positionMessage = ref('');
const isResolving = ref(false);

const resolveRadiusKm = () => {
  const value = Number(radiusKm.value);
  return Number.isFinite(value) ? value : null;
};

const applyPosition = (position) => {
  const location = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    radiusKm: resolveRadiusKm(),
  };
  const bounds = getCoordinateBoundsFromCenter({
    latitude: location.latitude,
    longitude: location.longitude,
    radiusKm: location.radiusKm,
  });

  if (bounds === null) {
    errorMessage.value = '현재 위치 또는 반경을 확인해주세요.';
    emit('location-cleared');
    return;
  }

  errorMessage.value = '';
  positionMessage.value = `현재 위치가 확인되었습니다. 추천 반경 ${location.radiusKm}km`;
  emit('location-selected', {
    ...location,
    bounds,
  });
};

const clearBounds = () => {
  errorMessage.value = '';
  positionMessage.value = '';
  radiusKm.value = 30;
  emit('location-cleared');
};

const useCurrentPosition = () => {
  if (!navigator.geolocation) {
    errorMessage.value = '현재 위치를 사용할 수 없습니다.';
    return;
  }

  isResolving.value = true;
  errorMessage.value = '';
  navigator.geolocation.getCurrentPosition(
    (position) => {
      applyPosition(position);
      isResolving.value = false;
    },
    () => {
      errorMessage.value = '현재 위치를 가져오지 못했습니다.';
      positionMessage.value = '';
      emit('location-cleared');
      isResolving.value = false;
    },
    {
      enableHighAccuracy: true,
      maximumAge: 60000,
      timeout: 10000,
    }
  );
};
</script>
