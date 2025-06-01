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
    const center = { lat: map_center.value.lat, lng: map_center.value.lng };

    mapInstance = new Map(mapRefElement.value, {
      center,
      zoom: 11,
      mapId: "4504f8b37365c3d0",
    });

    let number = 0;
    for (const property of properties) {
      const markerContent = buildContent(property, number++);
      const marker = new AdvancedMarkerElement({
        map: mapInstance,
        content: markerContent,
        position: { lat: property.latitude, lng: property.longitude },
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
        <span aria-hidden="true">${number}</span>
    </div>
    <div class="details">
        <div class="price">${property.name}</div>
        <div class="address">${property.address}</div>
        <div class="features">
        <div>
            <i aria-hidden="true" class="fa fa-calendar fa-lg bath" title="bathroom"></i>
            <span class="fa-sr-only">bathroom</span>
            <span>${property.bath}</span>
        </div>
        <div>
            <i aria-hidden="true" class="fa fa-clock fa-lg size" title="size"></i>
            <span class="fa-sr-only">size</span>
            <span>${property.size} ft<sup>2</sup></span>
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
@import "../../public/assets/css/googleMap.css";
</style>
