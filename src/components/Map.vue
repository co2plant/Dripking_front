<template>
  <div class="bg-white rounded-lg shadow p-6 mb-6 w-full h-screen" id="map" ref="mapRefElement"></div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue';
import { useTripStore } from "@/stores/useTripStore";
import { usePlanStore } from "@/stores/usePlanStore";
import { getValidCoordinates, hasValidCoordinates } from "@/utils/coordinates";
import { loadGoogleMapsAPI } from "@/utils/googleMaps";

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const tripStore = useTripStore();
const planStore = usePlanStore();

const mapRefElement = ref(null);
let mapInstance = null;
const apiKey = process.env.VUE_APP_GOOGLE_MAPS_API;

const map_center = ref({
  lat: 37.43238031167444,
  lng: -122.16795397128632,
});

const getTripPlansWithCoordinates = () => planStore.Plans
  .filter(plan => String(plan.trip_id) === String(props.id))
  .filter(hasValidCoordinates);

async function initMap() {
  if (!mapRefElement.value) {
    console.error("지도 컨테이너 요소를 찾을 수 없습니다.");
    return;
  }

  try {
    const googleMaps = await loadGoogleMapsAPI(apiKey);
    const { map } = await googleMaps.importLibrary("maps");
    const { AdvancedMarkerElement } = await googleMaps.importLibrary("marker");
    const center = { lat: map_center.value.lat, lng: map_center.value.lng };

    mapInstance = new map(mapRefElement.value, {
      center,
      zoom: 11,
      mapId: "4504f8b37365c3d0",
    });

    let number = 0;
    for (const property of getTripPlansWithCoordinates()) {
      const position = getValidCoordinates(property);

      if (position === null) {
        continue;
      }

      const markerContent = buildContent(property, number++);
      const marker = new AdvancedMarkerElement({
        map: mapInstance,
        content: markerContent,
        position,
        title: property.name,
      });

      markerContent.addEventListener("click", () => {
        toggleHighlight(marker);
      });
    }
  } catch (error) {
    console.error("지도 초기화 중 오류 발생:", error);
    if (mapRefElement.value) {
      mapRefElement.value.innerHTML = `<p style="padding: 1em; text-align: center; color: red;">지도를 로드하는 중 오류가 발생했습니다: ${error.message}</p>`;
    }
  }
}

function toggleHighlight(markerView) {
  const content = markerView.content;
  
  if (content.classList.contains("highlight")) {
    content.classList.remove("highlight");
    markerView.zIndex = null;
  } else {
    content.classList.add("highlight");
    markerView.zIndex = 1;
  }
}

function buildContent(property, number) {
  const content = document.createElement("div");
  content.classList.add("property");

  content.innerHTML = `
    <div class="icon">
        <b class="number" aria-hidden="true" title="${number+"번째여행"}">${number}</b>
        <span class="sr-only">${property.type}</span>
    </div>
    <div class="details">
        <div class="price" :v-if="property.name">${property.name}</div>
        <div class="address" :v-if="property.address">${property.address}</div>
        <div class="features">
        <div :v-if="property.date">
            <i aria-hidden="true" class="fa fa-solid fa-calendar fa-lg calendar" title="date"></i>
            <span class="sr-only">date</span>
            <span>${property.plan_date}</span>
        </div>
        <div :v-if="property.startTime">
            <i aria-hidden="true" class="fa fa-solid fa-clock fa-lg clock" title="starttime"></i>
            <span class="sr-only">start time</span>
            <span>${property.start_time}</span>
        </div>
        <div :v-if="property.endTime">
            <i aria-hidden="true" class="fa fa-solid fa-clock fa-lg clock" title="endtime"></i>
            <span class="sr-only">end time</span>
            <span>${property.end_time}</span>
        </div>
    </div>
  `;
  return content;
}

onMounted(() => {
  planStore.loadPlans();
  tripStore.loadTrips();

  const tripPlansWithCoordinates = getTripPlansWithCoordinates();
  if (tripPlansWithCoordinates.length > 0) {
    const center = getValidCoordinates(tripPlansWithCoordinates[0]);

    if (center === null) {
      return;
    }

    map_center.value = {
      lat: center.lat,
      lng: center.lng
    }
  }

  initMap();
});

</script>

<style scoped>
@import "../../public/assets/css/googleMap.css";
</style>
