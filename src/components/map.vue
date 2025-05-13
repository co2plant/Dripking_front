<script setup>
import { ref, onMounted, watch, defineProps } from 'vue';

const props = defineProps({
  plans: {
    type: Array,
    default: () => [] // 예: [{ name: '장소1', position: { lat: ..., lng: ... }}, ...]
  }
});

const mapRef = ref(null); // 지도 DOM 요소 참조
let map = null; // 지도 객체
let directionsService = null;
let directionsRenderer = null;
const googleMapsLoaded = ref(false);

// 중요: 'YOUR_API_KEY'를 실제 Google Maps API 키로 교체하세요.
// 이 키는 Maps JavaScript API와 Directions API가 활성화되어 있어야 합니다.
const apiKey = "";

function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      googleMapsLoaded.value = true;
      resolve();
      return;
    }
    // 전역 콜백 함수 정의
    window.initMapCallback = () => {
      googleMapsLoaded.value = true;
      resolve();
      delete window.initMapCallback; // 사용 후 삭제
    };

    const script = document.createElement('script');
    // `libraries`에 `marker`, `places`, `directions` 추가
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker,places,directions&callback=initMapCallback`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    script.onerror = (error) => {
      console.error("Google Maps 스크립트 로드 실패:", error);
      reject(error);
      delete window.initMapCallback; // 오류 발생 시에도 삭제
    };
  });
}

async function initializeMap() {
  if (!googleMapsLoaded.value || !mapRef.value) {
    console.warn("Google Maps API가 로드되지 않았거나 맵 컨테이너가 준비되지 않았습니다.");
    return;
  }

  const { Map } = await google.maps.importLibrary("maps");
  const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("directions");

  directionsService = new DirectionsService();
  directionsRenderer = new DirectionsRenderer();

  const initialCenter = (props.plans && props.plans.length > 0)
    ? props.plans[0].position
    : { lat: 37.5665, lng: 126.9780 }; // 기본값: 서울

  map = new Map(mapRef.value, {
    zoom: 12,
    center: initialCenter,
    // mapId: "4504f8b37365c3d0", // 필요시 특정 Map ID 사용
  });

  directionsRenderer.setMap(map);
  calculateAndDisplayRoute();
}

function calculateAndDisplayRoute() {
  if (!map || !directionsService || !directionsRenderer) return;

  if (!props.plans || props.plans.length === 0) {
    directionsRenderer.setDirections({ routes: [] }); // 경로 지우기
     // 모든 마커를 지우는 로직 추가 필요 (만약 개별 마커를 사용했다면)
    map.setCenter({ lat: 37.5665, lng: 126.9780 });
    map.setZoom(12);
    return;
  }
  
  if (props.plans.length === 1) {
    // 장소가 하나일 경우 해당 위치로 지도 중앙 이동 및 마커 표시 (선택적)
    directionsRenderer.setDirections({ routes: [] }); // 기존 경로 지우기
    map.setCenter(props.plans[0].position);
    map.setZoom(15);
    // 단일 마커 표시 (기본 Google Maps 마커)
    new google.maps.Marker({
        position: props.plans[0].position,
        map: map,
        title: props.plans[0].name || '선택된 장소'
    });
    return;
  }

  const waypoints = props.plans.slice(1, -1).map(plan => ({
    location: plan.position,
    stopover: true,
  }));

  directionsService.route(
    {
      origin: props.plans[0].position,
      destination: props.plans[props.plans.length - 1].position,
      waypoints: waypoints,
      optimizeWaypoints: true, // Google이 경유지 순서를 최적화하도록 허용 (true로 하면 순서가 바뀔 수 있음, 순서 유지가 중요하면 false)
      travelMode: google.maps.TravelMode.DRIVING, // 또는 WALKING, BICYCLING, TRANSIT
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
      } else {
        window.alert("경로 요청에 실패했습니다: " + status);
        console.error("Directions request failed due to " + status);
      }
    }
  );
}

onMounted(async () => {
  try {
    await loadGoogleMaps();
    // API 로드 후 props.plans 상태에 따라 지도 초기화
    // watch가 immediate:true 이므로 초기에도 실행됨
  } catch (error) {
    console.error("맵 초기화 중 오류 발생:", error);
  }
});

watch(() => props.plans, (newPlans, oldPlans) => {
  if (googleMapsLoaded.value) {
    if (!map) { // 지도가 아직 초기화되지 않았다면 초기화
        initializeMap();
    } else { // 지도가 이미 있다면 경로만 업데이트
        calculateAndDisplayRoute();
    }
  }
}, { deep: true, immediate: true }); // immediate: true로 초기 로드 시에도 실행

</script>

<template>
  <div id="map" ref="mapRef" class="w-full h-96"></div>
</template>

<style scoped>
/* ...existing code... */
:root {
  --building-color: #FF9800;
  --house-color: #0288D1;
  --shop-color: #7B1FA2;
  --warehouse-color: #558B2F;
}

/*
 * Optional: Makes the sample page fill the window.
 */
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#map { /* map div의 높이를 명시적으로 지정 */
  height: 500px; /* 필요에 따라 조절 */
}

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
  background-color: #FFFFFF;
  border-radius: 8px;
  box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.2);
  height: 80px;
  padding: 8px 15px;
  width: auto;
}

.property.highlight::after {
  border-top: 9px solid #FFFFFF;
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


</style>
```
