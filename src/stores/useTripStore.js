import { defineStore } from 'pinia';
import Trip from "@/composables/Entity/Trip";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiService } from "@/services/api";
import { v4 as uuidv4 } from 'uuid';

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
            const savedTrips = localStorage.getItem('Trips');
            if (savedTrips) {
                try {
                    const parsedTrips = JSON.parse(savedTrips);
                    this.Trips = parsedTrips.map(tripData => {
                         const trip = new Trip();
                         Object.assign(trip, tripData); 
                         trip.isLocal = true;
                         return trip.build();
                    });
                } catch (e) {
                    console.error("Error parsing local trips:", e);
                    this.Trips = [];
                    localStorage.removeItem('Trips');
                }
            } else {
                this.Trips = [];
                localStorage.setItem('Trips');
                console.log("No trips found in local storage.");
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
            localStorage.setItem('Trips', JSON.stringify(localTrips));
        },

        // 로컬 여행을 서버에 동기화 (생성)
        async _syncLocalTripsToServer() {
            if (this.isSyncing) return;
            this.isSyncing = true;

            const localTripsToSync = this.Trips.filter(trip => trip.isLocal);
            if (localTripsToSync.length === 0) {
                this.isSyncing = false;
                return;
            }

            console.log(`Syncing ${localTripsToSync.length} local trips to server...`);

            try {
                const syncPromises = localTripsToSync.map(async (localTrip) => {
                    try {
                        const requestDTO = new Trip();
                        Object.assign(requestDTO, localTrip);
                        const createdTripDTO = await apiService.postWithToken('trips', requestDTO.toRequestDTO());

                        const index = this.Trips.findIndex(t => t.id === localTrip.id);
                        if (index !== -1) {
                            this.Trips[index] = Trip.fromDTO(createdTripDTO);
                        }
                        console.log(`Synced local trip ${localTrip.id} -> server ID ${createdTripDTO.id}`);
                    } catch (syncError) {
                        console.error(`Error syncing local trip ${localTrip.id}:`, syncError);
                    }
                });
                await Promise.all(syncPromises);
                console.log("Local trips sync completed.");
            } catch (error) {
                console.error("Error during trip synchronization:", error);
            } finally {
                 this.isSyncing = false;
            }
        },

        // 메인 로드 함수: 로그인 상태 확인 후 로드 및 동기화 실행
        async loadTrips() {
            const authStore = useAuthStore();
            console.log("Loading trips...");
            if (authStore.isAuthenticated()) {
                await this._loadTripsFromServer();
                const localOnlyTrips = JSON.parse(localStorage.getItem('Trips') || '[]')
                                        .filter(localTrip => !this.Trips.some(serverTrip => serverTrip.id === localTrip.id));
                
                const tripsToSync = localOnlyTrips.map(tripData => {
                    const trip = new Trip();
                    Object.assign(trip, tripData);
                    trip.isLocal = true;
                    return trip.build();
                });

                if (tripsToSync.length > 0) {
                    this.Trips = [...this.Trips, ...tripsToSync];
                    await this._syncLocalTripsToServer();
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
                        await apiService.putWithToken(`trips?id=${tripId}`, requestDTO);
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
                    await apiService.deleteWithToken(`trips?id=${tripId}`);
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
