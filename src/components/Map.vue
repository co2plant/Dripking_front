<template>
  <div v-if="shouldRender" class="bg-white rounded-lg shadow p-6 mb-6 w-full h-screen" id="map" ref="mapRefElement"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineProps, nextTick, watch } from 'vue';
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
let googleMapsApi = null;
let AdvancedMarkerElementConstructor = null;
let routePolyline = null;
const markers = [];
const apiKey = process.env.VUE_APP_GOOGLE_MAPS_API;

const map_center = ref({
  lat: 37.43238031167444,
  lng: -122.16795397128632,
});

const sortOrderValue = (plan) => {
  const sortOrder = Number(plan.sort_order);
  return Number.isFinite(sortOrder) ? sortOrder : Number.MAX_SAFE_INTEGER;
};

const comparePlanOrder = (a, b) => {
  const sortOrderDiff = sortOrderValue(a) - sortOrderValue(b);
  if (sortOrderDiff !== 0) return sortOrderDiff;
  const dateDiff = String(a.plan_date || '').localeCompare(String(b.plan_date || ''));
  if (dateDiff !== 0) return dateDiff;
  const startTimeDiff = String(a.start_time || '').localeCompare(String(b.start_time || ''));
  if (startTimeDiff !== 0) return startTimeDiff;
  return String(a.id || '').localeCompare(String(b.id || ''));
};

const getTripPlansWithCoordinates = () => planStore.Plans
  .filter(plan => String(plan.trip_id) === String(props.id))
  .filter(hasValidCoordinates)
  .sort(comparePlanOrder);

const clearMarkers = () => {
  markers.forEach(marker => {
    marker.map = null;
  });
  markers.splice(0, markers.length);
};

const clearRoutePolyline = () => {
  if (routePolyline) {
    routePolyline.setMap(null);
    routePolyline = null;
  }
};

const clearMapOverlays = () => {
  clearMarkers();
  clearRoutePolyline();
};

const hideMap = () => {
  clearMapOverlays();
  mapInstance = null;
  shouldRender.value = false;
};

async function ensureMap(tripPlansWithCoordinates) {
  if (!apiKey || tripPlansWithCoordinates.length === 0) {
    hideMap();
    return false;
  }

  try {
    googleMapsApi = googleMapsApi || await loadGoogleMapsAPI(apiKey);
    shouldRender.value = true;
    await nextTick();

    if (!mapRefElement.value) {
      return false;
    }

    if (!mapInstance) {
      const { Map } = await googleMapsApi.importLibrary("maps");
      const firstPosition = getValidCoordinates(tripPlansWithCoordinates[0]);
      if (firstPosition === null) {
        hideMap();
        return false;
      }

      map_center.value = {
        lat: firstPosition.lat,
        lng: firstPosition.lng
      }

      mapInstance = new Map(mapRefElement.value, {
        center: firstPosition,
        zoom: 11,
        mapId: "4504f8b37365c3d0",
      });
    }

    if (!AdvancedMarkerElementConstructor) {
      const { AdvancedMarkerElement } = await googleMapsApi.importLibrary("marker");
      AdvancedMarkerElementConstructor = AdvancedMarkerElement;
    }

    return true;
  } catch (error) {
    console.error("지도 초기화 중 오류 발생:", error);
    hideMap();
    return false;
  }
}

const drawMarkers = (tripPlansWithCoordinates) => {
  let number = 0;

  for (const property of tripPlansWithCoordinates) {
    const position = getValidCoordinates(property);

    if (position === null) {
      continue;
    }

    const markerContent = buildContent(property, number++);
    const marker = new AdvancedMarkerElementConstructor({
      map: mapInstance,
      content: markerContent,
      position,
      title: getDisplayName(property),
    });

    markerContent.addEventListener("click", () => {
      toggleHighlight(marker);
    });

    markers.push(marker);
  }
};

const drawRoutePolyline = (tripPlansWithCoordinates) => {
  const path = tripPlansWithCoordinates
    .map(getValidCoordinates)
    .filter(position => position !== null);

  if (path.length < 2) {
    return;
  }

  const arrowPath = googleMapsApi.SymbolPath?.FORWARD_CLOSED_ARROW;

  routePolyline = new googleMapsApi.Polyline({
    path,
    geodesic: true,
    strokeColor: "#D97706",
    strokeOpacity: 0.9,
    strokeWeight: 4,
    icons: arrowPath ? [{
      icon: {
        path: arrowPath,
        scale: 3,
        strokeColor: "#92400E",
      },
      offset: "100%",
    }] : [],
    map: mapInstance,
  });
};

const fitMapToRoute = (tripPlansWithCoordinates) => {
  const path = tripPlansWithCoordinates
    .map(getValidCoordinates)
    .filter(position => position !== null);

  if (path.length === 0) {
    return;
  }

  if (path.length === 1) {
    mapInstance.setCenter(path[0]);
    mapInstance.setZoom(11);
    return;
  }

  const bounds = new googleMapsApi.LatLngBounds();
  path.forEach(position => bounds.extend(position));
  mapInstance.fitBounds(bounds, 80);
};

async function refreshMap() {
  const tripPlansWithCoordinates = getTripPlansWithCoordinates();
  const mapReady = await ensureMap(tripPlansWithCoordinates);

  if (!mapReady) {
    return;
  }

  clearMapOverlays();
  drawRoutePolyline(tripPlansWithCoordinates);
  drawMarkers(tripPlansWithCoordinates);
  fitMapToRoute(tripPlansWithCoordinates);
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
  await refreshMap();
});

watch(
  () => [props.id, planStore.Plans],
  () => {
    refreshMap();
  },
  { deep: true }
);

onUnmounted(() => {
  clearMapOverlays();
});

</script>

<style scoped>
@import "../../public/assets/css/googleMap.css";
</style>
