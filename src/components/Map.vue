<template>
  <div class="bg-white rounded-lg shadow p-6 mb-6 w-full h-screen" id="map" ref="mapRefElement"></div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue';
import { useTripStore } from "@/stores/useTripStore";
import { usePlanStore } from "@/stores/usePlanStore";
import { apiService } from "@/services/api";

const props = defineProps({
  tripId: {
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

function getMapCenterByFirstPlace(){
  apiService.get(`trips/${props.tripId}/places`)
    .then(response => {
      const firstPlace = response.data[0];
      map_center.value = {
        lat: firstPlace.lat,
        lng: firstPlace.lng
      };
    })
    .catch(error => {
      console.error("Error fetching places:", error);
    });
}

function loadGoogleMapsAPI() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    const callbackName = 'initMapCallback_' + Date.now();
    window[callbackName] = () => {
      resolve(window.google.maps);
      delete window[callbackName];
    };

    const script = document.createElement('script');

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&libraries=maps,marker`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    script.onerror = (error) => {
      console.error("Google Maps 스크립트 로드 실패:", error);
      reject(error);
      delete window[callbackName];
    };
  });
}

async function initMap() {
  if (!mapRefElement.value) {
    console.error("지도 컨테이너 요소를 찾을 수 없습니다.");
    return;
  }

  try {
    const googleMaps = await loadGoogleMapsAPI();
    const { Map } = await googleMaps.importLibrary("maps");
    const { AdvancedMarkerElement } = await googleMaps.importLibrary("marker");

    mapInstance = new Map(mapRefElement.value, {
      center: { lat: map_center.value.lat, lng: map_center.value.lng },
      zoom: 12,
      mapId: "4504f8b37365c3d0",
    });

    for (const property of properties) {
      const markerContent = buildContent(property);
      const marker = new AdvancedMarkerElement({
        map: mapInstance,
        content: markerContent,
        position: { lat: property.latitude, lng: property.longitude },
        title: property.name,
      });

      marker.addListener("gmp-click", () => {
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
  const details = content.querySelector('.marker-details');
  const name = content.querySelector('.marker-name');
  
  if (content.classList.contains("highlight")) {
    content.classList.remove("highlight");
    details.style.display = 'none';
    name.style.display = 'block';
    markerView.zIndex = null;
  } else {
    content.classList.add("highlight");
    details.style.display = 'block';
    name.style.display = 'none';
    markerView.zIndex = 1;
  }
}

function buildContent(property) {
  const content = document.createElement("div");
  content.classList.add("property");
  
  // 아이콘 클래스 결정
  let iconClass = 'fa-map-marker';
  switch(property.itemType) {
    case 'PLACE':
      iconClass = 'fa-map-marker';
      break;
    case 'DESTINATION':
      iconClass = 'fa-flag';
      break;
    case 'DISTILLERY':
      iconClass = 'fa-industry';
      break;
  }
  
  // 기본 상태 (이름만 표시)
  content.innerHTML = `
    <div class="marker-content">
      <i class="fa ${iconClass}"></i>
      <div class="marker-name">${property.name}</div>
    </div>
    <div class="marker-details" style="display: none;">
      <div class="details-header">
        <h3>${property.name}</h3>
        <span class="item-type">${property.itemType}</span>
      </div>
      <div class="details-body">
        <p><strong>주소:</strong> ${property.address || '주소 정보 없음'}</p>
        <p><strong>설명:</strong> ${property.description || '설명 정보 없음'}</p>
      </div>
    </div>
  `;
  return content;
}

const properties = [
  {
    id: 1,
    itemType: 'PLACE',
    name: "Emily St",
    latitude: 37.50024109655184,
    longitude: -122.28528451834352,
    description: "Single family house with modern design",
    address: "215 Emily St, MountainView, CA",
    img_url: null,
    plan_id: -1
  },
  {
    id: 2,
    itemType: 'DESTINATION',
    name: "Squirrel Ln",
    latitude: 37.44440882321596,
    longitude: -122.2160620727,
    description: "Townhouse with friendly neighbors",
    address: "108 Squirrel Ln, Menlo Park, CA",
    img_url: null,
    plan_id: -1
  },
  {
    id: 3,
    itemType: 'DISTILLERY',
    name: "Chris St",
    latitude: 37.39561833718522,
    longitude: -122.21855116258479,
    description: "Spacious warehouse great for small business",
    address: "100 Chris St, Portola Valley, CA",
    img_url: null,
    plan_id: -1
  },
  {
    id: 4,
    itemType: 'PLACE',
    name: "Aleh Ave",
    latitude: 37.423928529779644,
    longitude: -122.1087629822001,
    description: "A lovely store on busy road",
    address: "98 Aleh Ave, Palo Alto, CA",
    img_url: null,
    plan_id: -1
  },
  {
    id: 5,
    itemType: 'PLACE',
    name: "Su St",
    latitude: 37.40578635332598,
    longitude: -122.15043378466069,
    description: "Single family house near golf club",
    address: "2117 Su St, MountainView, CA",
    img_url: null,
    plan_id: -1
  },
  {
    id: 6,
    itemType: 'PLACE',
    name: "Alicia Dr",
    latitude: 37.36399747905774,
    longitude: -122.10465384268522,
    description: "Multifloor large warehouse",
    address: "197 Alicia Dr, Santa Clara, CA",
    img_url: null,
    plan_id: -1
  },
  {
    id: 7,
    itemType: 'PLACE',
    name: "Jose Ave",
    latitude: 37.38343706184458,
    longitude: -122.02340436985183,
    description: "3 storey townhouse with 2 car garage",
    address: "700 Jose Ave, Sunnyvale, CA",
    img_url: null,
    plan_id: -1
  },
  {
    id: 8,
    itemType: 'PLACE',
    name: "Will Ct",
    latitude: 37.34576403052,
    longitude: -122.04455090047453,
    description: "Single family house in great school zone",
    address: "868 Will Ct, Cupertino, CA",
    img_url: null,
    plan_id: -1
  },
  {
    id: 9,
    itemType: 'PLACE',
    name: "Haylee St",
    latitude: 37.362863347890716,
    longitude: -121.97802139023555,
    description: "2 storey store with large storage room",
    address: "655 Haylee St, Santa Clara, CA",
    img_url: null,
    plan_id: -1
  },
  {
    id: 10,
    itemType: 'PLACE',
    name: "Natasha Dr",
    latitude: 37.41391636421949,
    longitude: -121.94592071575907,
    description: "Single family house",
    address: "2019 Natasha Dr, San Jose, CA",
    img_url: null,
    plan_id: -1
  },
];


onMounted(() => {
  planStore.loadPlans();
  tripStore.loadTrips();
  getMapCenterByFirstPlace();

  if (planStore.plan && planStore.plan.length > 0) {
    map_center.value = {
      lat: planStore.plan[0].place_id,
      lng: planStore.plan[0].lng
    }
  }

  initMap();
});

</script>

<style scoped>

:root {
  --building-color: #FF9800;
  --house-color: #0288D1;
  --shop-color: #7B1FA2;
  --warehouse-color: #558B2F;
}

/*
 * Property styles in unhighlighted state.
 */
.property {
  align-items: center;
  background-color: #FFFFFF;
  border-radius: 50%;
  color: #263238;
  display: flex;
  font-size: 14px;
  gap: 15px;
  height: 30px;
  justify-content: center;
  padding: 4px;
  position: relative;
  position: relative;
  transition: all 0.3s ease-out;
  width: 30px;
}

.property::after {
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-top: 9px solid #FFFFFF;
  content: "";
  height: 0;
  left: 50%;
  position: absolute;
  top: 95%;
  transform: translate(-50%, 0);
  transition: all 0.3s ease-out;
  width: 0;
  z-index: 1;
}

.property .icon {
  align-items: center;
  display: flex;
  justify-content: center;
  color: #FFFFFF;
}

.property .icon svg {
  height: 20px;
  width: auto;
}

.property .details {
  display: none;
  flex-direction: column;
  flex: 1;
}

.property .address {
  color: #9E9E9E;
  font-size: 10px;
  margin-bottom: 10px;
  margin-top: 5px;
}

.property .features {
  align-items: flex-end;
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.property .features > div {
  align-items: center;
  background: #F5F5F5;
  border-radius: 5px;
  border: 1px solid #ccc;
  display: flex;
  font-size: 10px;
  gap: 5px;
  padding: 5px;
}

/*
 * Property styles in highlighted state.
 */
.property.highlight {
  background-color: transparent;
  box-shadow: none;
  height: auto;
  width: auto;
  padding: 0;
}

.property.highlight::after {
  display: none;
}

.property.highlight .details {
  display: flex;
}

.property.highlight .icon svg {
  width: 50px;
  height: 50px;
}

.property .bed {
  color: #FFA000;
}

.property .bath {
  color: #03A9F4;
}

.property .size {
  color: #388E3C;
}

/*
 * House icon colors.
 */
.property.highlight:has(.fa-house) .icon {
  color: var(--house-color);
}

.property:not(.highlight):has(.fa-house) {
  background-color: var(--house-color);
}

.property:not(.highlight):has(.fa-house)::after {
  border-top: 9px solid var(--house-color);
}

/*
 * Building icon colors.
 */
.property.highlight:has(.fa-building) .icon {
  color: var(--building-color);
}

.property:not(.highlight):has(.fa-building) {
  background-color: var(--building-color);
}

.property:not(.highlight):has(.fa-building)::after {
  border-top: 9px solid var(--building-color);
}

/*
 * Warehouse icon colors.
 */
.property.highlight:has(.fa-warehouse) .icon {
  color: var(--warehouse-color);
}

.property:not(.highlight):has(.fa-warehouse) {
  background-color: var(--warehouse-color);
}

.property:not(.highlight):has(.fa-warehouse)::after {
  border-top: 9px solid var(--warehouse-color);
}

/*
 * Shop icon colors.
 */
.property.highlight:has(.fa-shop) .icon {
  color: var(--shop-color);
}

.property:not(.highlight):has(.fa-shop) {
  background-color: var(--shop-color);
}

.property:not(.highlight):has(.fa-shop)::after {
  border-top: 9px solid var(--shop-color);
}

.marker-content {
  background-color: #263238;
  border-radius: 4px;
  padding: 4px 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  min-width: 100px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 4px;
}

.marker-content i {
  color: #4285F4;
  font-size: 16px;
}

.marker-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  max-width: 150px;
}

.marker-details {
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  min-width: 200px;
  max-width: 300px;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-type {
  font-size: 12px;
  color: #666;
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.details-body {
  font-size: 14px;
  color: #666;
}

.details-body p {
  margin: 4px 0;
}

</style>
