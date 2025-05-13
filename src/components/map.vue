<template>
  <div id="map" ref="mapRefElement"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const mapRefElement = ref(null);
let mapInstance = null;
const apiKey = "";

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

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&libraries=maps`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    script.onerror = (error) => {
      console.error("Google Maps 스크립트 로드 실패:", error);
      reject(error);
      delete window[callbackName]; // 오류 발생 시에도 정리
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
    // google.maps.importLibrary를 사용하여 Maps 라이브러리를 가져옵니다.
    const { Map } = await googleMaps.importLibrary("maps");

    mapInstance = new Map(mapRefElement.value, {
      center: { lat: 37.5665, lng: 126.9780 }, // 기본 위치: 서울
      zoom: 12,
    });
    console.log("Map initialized:", mapInstance);
  } catch (error) {
    console.error("지도 초기화 중 오류 발생:", error);
    if (mapRefElement.value) {
        mapRefElement.value.innerHTML = `<p style="padding: 1em; text-align: center; color: red;">지도를 로드하는 중 오류가 발생했습니다: ${error.message}</p>`;
    }
  }
}

onMounted(() => {
  initMap();
});

</script>

<style scoped>
#map {
  width: 100%;
  height: 400px;
  background-color: #f0f0f0;
}
</style>
