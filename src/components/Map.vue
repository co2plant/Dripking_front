<template>
  <div v-if="shouldRender" class="bg-white rounded-lg shadow p-6 mb-6 w-full h-screen" id="map" ref="mapRefElement"></div>
</template>

<script setup>
import { ref, onMounted, defineProps, nextTick } from 'vue';
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
const shouldRender = ref(false);
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
  if (!mapRefElement.value || !apiKey) {
    shouldRender.value = false;
    return;
  }

  try {
    const googleMaps = await loadGoogleMapsAPI(apiKey);
    const { Map } = await googleMaps.importLibrary("maps");
    const { AdvancedMarkerElement } = await googleMaps.importLibrary("marker");
    const center = { lat: map_center.value.lat, lng: map_center.value.lng };

    mapInstance = new Map(mapRefElement.value, {
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
    shouldRender.value = false;
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

const getDisplayName = (property) => {
  return property.name || property.place_name || property.snapshot_name || property.custom_place_name || '일정';
};

const getDisplayAddress = (property) => {
  return property.address || property.snapshot_address || property.custom_place_address || '';
};

const appendFeature = (features, iconClass, label, value) => {
  if (!value) return;

  const feature = document.createElement("div");
  const icon = document.createElement("i");
  const srLabel = document.createElement("span");
  const text = document.createElement("span");

  icon.setAttribute("aria-hidden", "true");
  icon.className = iconClass;
  icon.title = label;
  srLabel.classList.add("sr-only");
  srLabel.textContent = label;
  text.textContent = value;

  feature.append(icon, srLabel, text);
  features.appendChild(feature);
};

function buildContent(property, number) {
  const content = document.createElement("div");
  content.classList.add("property");

  const icon = document.createElement("div");
  const order = document.createElement("b");
  const itemType = document.createElement("span");
  const details = document.createElement("div");
  const name = document.createElement("div");
  const address = getDisplayAddress(property);
  const features = document.createElement("div");

  icon.classList.add("icon");
  order.classList.add("number");
  order.setAttribute("aria-hidden", "true");
  order.title = `${number + 1}번째 여행`;
  order.textContent = String(number + 1);
  itemType.classList.add("sr-only");
  itemType.textContent = property.item_type || property.type || 'plan';
  icon.append(order, itemType);

  details.classList.add("details");
  name.classList.add("price");
  name.textContent = getDisplayName(property);
  details.appendChild(name);

  if (address) {
    const addressElement = document.createElement("div");
    addressElement.classList.add("address");
    addressElement.textContent = address;
    details.appendChild(addressElement);
  }

  features.classList.add("features");
  appendFeature(features, "fa fa-solid fa-calendar fa-lg calendar", "date", property.plan_date);
  appendFeature(features, "fa fa-solid fa-clock fa-lg clock", "start time", property.start_time);
  appendFeature(features, "fa fa-solid fa-clock fa-lg clock", "end time", property.end_time);

  if (features.children.length > 0) {
    details.appendChild(features);
  }

  content.append(icon, details);
  return content;
}

onMounted(async () => {
  await planStore.loadPlans(props.id);
  await tripStore.loadTrips();

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

  if (tripPlansWithCoordinates.length === 0 || !apiKey) {
    return;
  }

  shouldRender.value = true;
  await nextTick();
  initMap();
});

</script>

<style scoped>
@import "../../public/assets/css/googleMap.css";
</style>
