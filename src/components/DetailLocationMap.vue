<template>
  <section v-if="shouldRender" class="mb-12">
    <div
      v-if="hasPosition"
      ref="mapRefElement"
      class="w-full h-80 rounded-lg shadow bg-zinc-100"
    ></div>
    <div v-else class="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-600">
      지도 위치 정보가 없습니다.
    </div>
  </section>
</template>

<script setup>
import {defineProps, nextTick, onMounted, ref} from "vue";
import {apiService} from "@/services/api";
import {getValidCoordinates} from "@/utils/coordinates";
import {loadGoogleMapsAPI} from "@/utils/googleMaps";

const ItemTypes = {
  DESTINATION: 'destinations',
  DISTILLERY: 'distilleries'
}

const props = defineProps({
  itemType: {
    type: String,
    required: true
  },
  targetId: {
    type: [String, Number],
    required: true
  }
});

const apiKey = process.env.VUE_APP_GOOGLE_MAPS_API;
const mapRefElement = ref(null);
const hasPosition = ref(false);
const shouldRender = ref(false);

const buildMarkerContent = (item) => {
  const content = document.createElement("div");
  content.classList.add("property");
  content.innerHTML = `
    <div class="icon">
      <span class="sr-only">${item.name}</span>
    </div>
    <div class="details">
      <div class="price">${item.name}</div>
      ${item.address ? `<div class="address">${item.address}</div>` : ''}
    </div>
  `;

  return content;
};

const initMap = async (item, position) => {
  if (!mapRefElement.value || !apiKey) {
    shouldRender.value = false;
    return;
  }

  const googleMaps = await loadGoogleMapsAPI(apiKey);
  const { Map } = await googleMaps.importLibrary("maps");
  const { AdvancedMarkerElement } = await googleMaps.importLibrary("marker");
  const mapInstance = new Map(mapRefElement.value, {
    center: position,
    zoom: 13,
    mapId: "4504f8b37365c3d0",
  });

  new AdvancedMarkerElement({
    map: mapInstance,
    content: buildMarkerContent(item),
    position,
    title: item.name,
  });
};

onMounted(async () => {
  const resource = ItemTypes[props.itemType];

  if (!resource) {
    return;
  }

  try {
    const item = await apiService.get(`${resource}/${props.targetId}`);
    const position = getValidCoordinates(item);

    shouldRender.value = true;
    hasPosition.value = position !== null;

    if (position !== null) {
      await nextTick();
      await initMap(item, position);
    }
  } catch (error) {
    console.error("지도 초기화 중 오류 발생:", error);
    shouldRender.value = false;
  }
});
</script>

<style scoped>
@import "../../public/assets/css/googleMap.css";
</style>
