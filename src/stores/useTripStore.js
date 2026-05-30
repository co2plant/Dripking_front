import { defineStore } from 'pinia';
import Trip from "@/composables/Entity/Trip";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiService } from "@/services/api";
import { v4 as uuidv4 } from 'uuid';
import Plan from "@/composables/Entity/Plan";

const TRIPS_STORAGE_KEY = 'Trips';
const PLANS_STORAGE_KEY = 'Plans';
const TRIP_SYNC_MAP_STORAGE_KEY = 'TripSyncMap';
const PLAN_SYNC_MAP_STORAGE_KEY = 'PlanSyncMap';

const readJsonArray = (key) => {
    const value = localStorage.getItem(key);
    if (!value) {
        return [];
    }

    try {
        const parsedValue = JSON.parse(value);
        return Array.isArray(parsedValue) ? parsedValue : [];
    } catch (error) {
        console.error(`Error parsing ${key}:`, error);
        return [];
    }
};

const writeJsonArray = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

const readJsonObject = (key) => {
    const value = localStorage.getItem(key);
    if (!value) {
        return {};
    }

    try {
        const parsedValue = JSON.parse(value);
        return parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)
            ? parsedValue
            : {};
    } catch (error) {
        console.error(`Error parsing ${key}:`, error);
        return {};
    }
};

const writeJsonObject = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

const getPlanTripId = (plan) => plan.trip_id ?? plan.tripId;

const toTrip = (tripData) => {
    const trip = new Trip();
    Object.assign(trip, tripData);
    return trip.build();
};

const toPlan = (planData) => {
    const plan = new Plan();
    Object.assign(plan, planData);
    return plan.build();
};

export const useTripStore = defineStore('trip', {
    state: () => ({
        Trips: [],
        isLoading: false,
        isSyncing: false,
    }),
    getters: {
        sortedTrips: (state) => {
            return [...state.Trips].sort((a, b) => {
                const dateA = new Date(`${a.start_date}`)
                const dateB = new Date(`${b.start_date}`)
                return dateA - dateB
            })
        }
    },
    actions:{
        // 로컬 스토리지에서 여행 로드 (주로 비로그인 시 사용)
        _loadTripsFromLocal() {
            const savedTrips = readJsonArray(TRIPS_STORAGE_KEY);
            if (savedTrips.length > 0) {
                this.Trips = savedTrips.map(tripData => {
                    const trip = toTrip(tripData);
                    trip.isLocal = true;
                    return trip;
                });
            } else {
                this.Trips = [];
                writeJsonArray(TRIPS_STORAGE_KEY, []);
            }
            this.isLoaded = true;
        },

        // 서버에서 여행 로드 (로그인 시 사용)
        async _loadTripsFromServer() {
            try {
                const response = await apiService.getWithToken('trips');
                if (response && response.content) {
                    this.Trips = response.content.map(dto => Trip.fromDTO(dto));
                } else {
                    this.Trips = [];
                }
            } catch (error) {
                console.error("Error loading trips from server:", error);
                this._loadTripsFromLocal();
            }
             this.isLoaded = true;
        },

        // 로컬 변경사항을 로컬 스토리지에 저장
        _saveTripsToLocal() {
            const localTrips = this.Trips.filter(trip => trip.isLocal);
            writeJsonArray(TRIPS_STORAGE_KEY, localTrips);
        },

        async _createOrUpdateSyncedTrip(localTrip, tripSyncMap) {
            const localTripId = String(localTrip.id);
            const requestDTO = localTrip.toRequestDTO();
            const existingServerTripId = tripSyncMap[localTripId];

            if (existingServerTripId) {
                await apiService.putWithToken(`trips/${existingServerTripId}`, requestDTO);
                return existingServerTripId;
            }

            const createdTripDTO = await apiService.postWithToken('trips', requestDTO);
            tripSyncMap[localTripId] = createdTripDTO.id;
            writeJsonObject(TRIP_SYNC_MAP_STORAGE_KEY, tripSyncMap);
            return createdTripDTO.id;
        },

        async _syncLocalPlanToServer(localPlanData, serverTripId, planSyncMap) {
            const localPlanId = String(localPlanData.id);
            if (planSyncMap[localPlanId]) {
                return planSyncMap[localPlanId];
            }

            const localPlan = toPlan(localPlanData);
            localPlan.trip_id = serverTripId;
            const createdPlanDTO = await apiService.postWithToken(`trips/${serverTripId}/plans`, localPlan.toRequestDTO());
            planSyncMap[localPlanId] = createdPlanDTO.id;
            writeJsonObject(PLAN_SYNC_MAP_STORAGE_KEY, planSyncMap);
            return createdPlanDTO.id;
        },

        // 로컬 여행과 일정을 서버에 동기화한다. 실패 시 로컬 데이터와 sync map을 남겨 재시도한다.
        async syncLocalTripsAndPlansToServer() {
            if (this.isSyncing) {
                return { success: false, error: 'Trip sync is already running.' };
            }

            const localTrips = readJsonArray(TRIPS_STORAGE_KEY);
            const localPlans = readJsonArray(PLANS_STORAGE_KEY);
            if (localTrips.length === 0) {
                return { success: true, syncedTrips: 0 };
            }

            this.isSyncing = true;
            const tripSyncMap = readJsonObject(TRIP_SYNC_MAP_STORAGE_KEY);
            const planSyncMap = readJsonObject(PLAN_SYNC_MAP_STORAGE_KEY);
            const syncedLocalTripIds = new Set();
            const failedTripIds = [];

            for (const localTripData of localTrips) {
                const localTrip = toTrip(localTripData);
                const localTripId = String(localTrip.id);

                try {
                    const serverTripId = await this._createOrUpdateSyncedTrip(localTrip, tripSyncMap);
                    const tripPlans = localPlans.filter(plan => String(getPlanTripId(plan)) === localTripId);

                    for (const localPlanData of tripPlans) {
                        await this._syncLocalPlanToServer(localPlanData, serverTripId, planSyncMap);
                    }

                    syncedLocalTripIds.add(localTripId);
                } catch (syncError) {
                    console.error(`Error syncing local trip ${localTripId}:`, syncError);
                    failedTripIds.push(localTripId);
                }
            }

            if (syncedLocalTripIds.size > 0) {
                const remainingTrips = localTrips.filter(trip => !syncedLocalTripIds.has(String(trip.id)));
                const remainingPlans = localPlans.filter(plan => !syncedLocalTripIds.has(String(getPlanTripId(plan))));

                syncedLocalTripIds.forEach(localTripId => delete tripSyncMap[localTripId]);
                localPlans
                    .filter(plan => syncedLocalTripIds.has(String(getPlanTripId(plan))))
                    .forEach(plan => delete planSyncMap[String(plan.id)]);

                writeJsonArray(TRIPS_STORAGE_KEY, remainingTrips);
                writeJsonArray(PLANS_STORAGE_KEY, remainingPlans);
                writeJsonObject(TRIP_SYNC_MAP_STORAGE_KEY, tripSyncMap);
                writeJsonObject(PLAN_SYNC_MAP_STORAGE_KEY, planSyncMap);
            }

            this.isSyncing = false;

            if (failedTripIds.length === 0) {
                await this._loadTripsFromServer();
            } else {
                await this._loadTripsFromServer();
                const remainingLocalTrips = readJsonArray(TRIPS_STORAGE_KEY).map(tripData => {
                    const trip = toTrip(tripData);
                    trip.isLocal = true;
                    return trip;
                });
                this.Trips = [...this.Trips, ...remainingLocalTrips];
            }

            return {
                success: failedTripIds.length === 0,
                syncedTrips: syncedLocalTripIds.size,
                failedTripIds,
            };
        },

        // 메인 로드 함수: 로그인 상태 확인 후 로드 및 동기화 실행
        async loadTrips() {
            const authStore = useAuthStore();
            if (authStore.isAuthenticated()) {
                await this._loadTripsFromServer();
                const localOnlyTrips = readJsonArray(TRIPS_STORAGE_KEY);
                const tripsToSync = localOnlyTrips.map(tripData => {
                    const trip = toTrip(tripData);
                    trip.isLocal = true;
                    return trip;
                });

                if (tripsToSync.length > 0) {
                    this.Trips = [...this.Trips, ...tripsToSync];
                    await this.syncLocalTripsAndPlansToServer();
                }

            } else {
                await this._loadTripsFromLocal();
            }
        },

        // 여행 찾기 (로컬 상태에서)
        findTripById(tripId){
            return this.Trips.find(trip => String(trip.id) === String(tripId));
        },

        // 여행 추가
        async addTrip(newTripData){
            const authStore = useAuthStore();
            const newTrip = new Trip();
            Object.assign(newTrip, newTripData);

            if (authStore.isAuthenticated()) {
                try {
                    const requestDTO = newTrip.toRequestDTO();
                    const createdTripDTO = await apiService.postWithToken('trips', requestDTO);
                    const createdTrip = Trip.fromDTO(createdTripDTO);
                    this.Trips.push(createdTrip);
                    return createdTrip;
                } catch (error) {
                    console.error("Error adding trip to server:", error);
                    return null;
                }
            } else {
                newTrip.id = uuidv4();
                newTrip.isLocal = true;
                const builtTrip = newTrip.build();
                this.Trips.push(builtTrip);
                this._saveTripsToLocal();
                return builtTrip;
            }
        },

        // 여행 수정
        async updateTrip(tripId, updatedTripData) {
            const authStore = useAuthStore();
            const tripIndex = this.Trips.findIndex(trip => String(trip.id) === String(tripId));
            if (tripIndex === -1) return false;

            const originalTrip = this.Trips[tripIndex];
            const updatedTrip = new Trip();
            Object.assign(updatedTrip, originalTrip, updatedTripData);

            if (authStore.isAuthenticated()) {
                if (originalTrip.isLocal) {
                    try {
                        const requestDTO = updatedTrip.toRequestDTO();
                        const createdTripDTO = await apiService.postWithToken('trips', requestDTO);
                        this.Trips[tripIndex] = Trip.fromDTO(createdTripDTO);
                        this._saveTripsToLocal();
                        return true;
                    } catch (error) {
                        console.error(`Error syncing/creating local trip ${tripId} during update:`, error);
                        return false;
                    }
                } else {
                    // 서버 여행 -> 서버에 수정
                    try {
                        const requestDTO = updatedTrip.toRequestDTO();
                        await apiService.putWithToken(`trips/${tripId}`, requestDTO);
                        this.Trips[tripIndex] = updatedTrip.build();
                        this._saveTripsToLocal();
                        return true;
                    } catch (error) {
                        console.error(`Error updating server trip ${tripId}:`, error);
                        return false;
                    }
                }
            } else {
                updatedTrip.isLocal = true;
                this.Trips[tripIndex] = updatedTrip.build();
                this._saveTripsToLocal();
                return true;
            }
        },

        // 여행 삭제
        async removeTrip(tripId){
            const authStore = useAuthStore();
            const tripIndex = this.Trips.findIndex(trip => String(trip.id) === String(tripId));
            if (tripIndex === -1) return;

            const tripToRemove = this.Trips[tripIndex];

            if (authStore.isAuthenticated() && !tripToRemove.isLocal) {
                try {
                    await apiService.deleteWithToken(`trips/${tripId}`);
                    this.Trips.splice(tripIndex, 1);
                    this._saveTripsToLocal();
                } catch (error) {
                    console.error(`Error deleting server trip ${tripId}:`, error);
                }
            } else {
                this.Trips.splice(tripIndex, 1);
                this._saveTripsToLocal();
            }
        },

        handleLogout() {
        }
    },
})
