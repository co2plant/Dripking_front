<template>
  <section v-if="shouldRender" class="mx-auto mb-8 w-full max-w-5xl px-4">
    <div ref="mapRefElement" class="h-80 w-full rounded-lg bg-zinc-100 shadow"></div>
  </section>
</template>

<script setup>
import { defineProps, nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiService } from '@/services/api';
import { getValidCoordinates } from '@/utils/coordinates';
import { loadGoogleMapsAPI } from '@/utils/googleMaps';
import { recordInteractionEvent } from '@/services/interactionEvents';

const props = defineProps({
  endpoint: {
    type: String,
    required: true,
  },
  itemType: {
    type: String,
    required: true,
  },
  detailRouteName: {
    type: String,
    required: true,
  },
});

const router = useRouter();
const apiKey = process.env.VUE_APP_GOOGLE_MAPS_API;
const shouldRender = ref(false);
const mapRefElement = ref(null);
const markers = ref([]);

const buildMarkerContent = (item) => {
  const content = document.createElement('button');
  content.type = 'button';
  content.classList.add('property');
  content.innerHTML = `
    <div class="icon">
      <span class="sr-only">${item.name}</span>
    </div>
    <div class="details">
      <div class="price">${item.name}</div>
      ${item.address ? `<div class="address">${item.address}</div>` : ''}
    </div>
  `;

  content.addEventListener('click', () => {
    recordInteractionEvent(props.itemType, item.id, 'LIST_CARD_CLICK');
    router.push({ name: props.detailRouteName, params: { id: item.id } });
  });

  return content;
};

const initMap = async () => {
  if (!apiKey || !mapRefElement.value || markers.value.length === 0) {
    shouldRender.value = false;
    return;
  }

  try {
    const googleMaps = await loadGoogleMapsAPI(apiKey);
    const { Map } = await googleMaps.importLibrary('maps');
    const { AdvancedMarkerElement } = await googleMaps.importLibrary('marker');
    const firstPosition = getValidCoordinates(markers.value[0]);
    const mapInstance = new Map(mapRefElement.value, {
      center: firstPosition,
      zoom: 11,
      mapId: '4504f8b37365c3d0',
    });

    markers.value.forEach((item) => {
      const position = getValidCoordinates(item);
      if (position === null) return;

      new AdvancedMarkerElement({
        map: mapInstance,
        content: buildMarkerContent(item),
        position,
        title: item.name,
      });
    });
  } catch (error) {
    console.error('목록 지도 초기화 중 오류 발생:', error);
    shouldRender.value = false;
  }
};

onMounted(async () => {
  if (!apiKey) {
    return;
  }

  try {
    const response = await apiService.get(props.endpoint);
    markers.value = Array.isArray(response)
        ? response.filter(item => getValidCoordinates(item) !== null)
        : [];

    shouldRender.value = markers.value.length > 0;
    if (shouldRender.value) {
      await nextTick();
      await initMap();
    }
  } catch (error) {
    console.error('목록 지도 데이터를 불러오지 못했습니다:', error);
    shouldRender.value = false;
  }
});
</script>

<style scoped>
@import "../../public/assets/css/googleMap.css";
</style>
