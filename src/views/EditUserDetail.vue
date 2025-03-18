<template>
  <div class="container mx-auto p-4 bg-zinc-50 min-h-screen">
    <!-- 페이지 헤더 -->
    <div class="mb-6 bg-white rounded-lg shadow p-6">
      <h1 class="text-3xl font-bold text-zinc-900">회원정보 수정</h1>
      <p class="text-zinc-600">프로필 정보와 계정 설정을 관리하세요</p>
    </div>

    <!-- 프로필 수정 폼 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 왼쪽 사이드바 - 프로필 이미지 및 메뉴 -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex flex-col items-center">
            <div class="relative mb-4">
              <div class="w-32 h-32 rounded-full overflow-hidden bg-zinc-200 border-4 border-amber-400">
                <img
                    v-if="userProfile.profileImage"
                    :src="userProfile.profileImage"
                    alt="프로필 이미지"
                    class="w-full h-full object-cover"
                />
                <user-icon v-else class="w-full h-full p-6 text-zinc-400" />
              </div>
              <button
                  @click="triggerFileInput"
                  class="absolute bottom-0 right-0 bg-amber-400 hover:bg-amber-500 text-zinc-900 rounded-full p-2 shadow-md"
              >
                <camera-icon class="w-5 h-5" />
              </button>
              <input
                  type="file"
                  ref="fileInput"
                  accept="image/*"
                  class="hidden"
                  @change="handleImageUpload"
              />
            </div>
            <h2 class="text-xl font-bold text-zinc-900">{{ userProfile.name }}</h2>
            <p class="text-zinc-600">{{ userProfile.email }}</p>
          </div>

          <!-- 탭 메뉴 -->
          <div class="mt-8 space-y-2">
            <button
                v-for="(tab, index) in tabs"
                :key="index"
                @click="activeTab = tab.id"
                class="w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors duration-200"
                :class="activeTab === tab.id
                ? 'bg-amber-400 text-zinc-900 font-medium shadow-sm'
                : 'hover:bg-zinc-100 text-zinc-700'"
            >
              <component :is="tab.icon" class="w-5 h-5 mr-3" />
              {{ tab.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- 오른쪽 메인 컨텐츠 -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow">
          <!-- 기본 정보 탭 -->
          <div v-if="activeTab === 'profile'" class="p-6 space-y-6">
            <h3 class="text-xl font-bold text-zinc-900 mb-4 pb-2 border-b border-zinc-200">기본 정보</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-lg font-medium text-zinc-900 mb-2">
                  이름
                </label>
                <input
                    v-model="userProfile.name"
                    type="text"
                    class="w-full py-1 px-4 rounded-2xl border-zinc-300 bg-zinc-100 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label class="block text-lg font-medium text-zinc-900 mb-2">
                  닉네임
                </label>
                <input
                    v-model="userProfile.nickname"
                    type="text"
                    class="w-full py-1 px-4 rounded-2xl border-zinc-300 bg-zinc-100 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-lg font-medium text-zinc-900 mb-2">
                이메일
              </label>
              <input
                  v-model="userProfile.email"
                  type="email"
                  disabled
                  class="w-full py-1 px-4 rounded-2xl border-zinc-300 bg-zinc-200 text-zinc-500"
              />
              <p class="text-xs text-zinc-500 mt-1">이메일은 변경할 수 없습니다.</p>
            </div>

            <div>
              <label class="block text-lg font-medium text-zinc-900 mb-2">
                선호하는 여행 스타일
              </label>
              <div class="flex flex-wrap gap-2 mt-2">
                <button
                    v-for="style in travelStyles"
                    :key="style"
                    @click="toggleTravelStyle(style)"
                    class="px-3 py-1 rounded-full text-sm transition-colors duration-200"
                    :class="userProfile.travelStyles.includes(style)
                    ? 'bg-amber-400 text-zinc-900 font-medium shadow-sm'
                    : 'bg-zinc-100 border border-zinc-300 text-zinc-700 hover:bg-zinc-200'"
                >
                  {{ style }}
                </button>
              </div>
            </div>
          </div>

          <!-- 비밀번호 변경 탭 -->
          <div v-if="activeTab === 'password'" class="p-6 space-y-6">
            <h3 class="text-xl font-bold text-zinc-900 mb-4 pb-2 border-b border-zinc-200">비밀번호 변경</h3>

            <div>
              <label class="block text-ls font-medium text-zinc-900 mb-2">
                현재 비밀번호
              </label>
              <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="w-full py-1 px-4 rounded-2xl border-zinc-300 bg-zinc-100 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>

            <div>
              <label class="block text-ls font-medium text-zinc-900 mb-2">
                새 비밀번호
              </label>
              <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="w-full py-1 px-4 rounded-2xl border-zinc-300 bg-zinc-100 focus:border-amber-500 focus:ring-amber-500"
              />
              <p class="text-xs text-zinc-500 mt-1">8자 이상, 영문, 숫자, 특수문자를 포함해주세요.</p>
            </div>

            <div>
              <label class="block text-ls font-medium text-zinc-900 mb-2">
                새 비밀번호 확인
              </label>
              <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="w-full py-1 px-4 rounded-2xl border-zinc-300 bg-zinc-100 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>

          <!-- 알림 설정 탭 -->
          <div v-if="activeTab === 'notifications'" class="p-6 space-y-6">
            <h3 class="text-xl font-bold text-zinc-900 mb-4 pb-2 border-b border-zinc-200">알림 설정</h3>

            <div class="space-y-4">
              <div v-for="(notification, index) in notificationSettings" :key="index"
                   class="flex items-center justify-between py-3 px-4 bg-zinc-50 rounded-lg border border-zinc-200"
              >
                <div class="text-left">
                  <h4 class="font-medium text-zinc-900">{{ notification.title }}</h4>
                  <p class="text-sm text-zinc-600">{{ notification.description }}</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                      type="checkbox"
                      v-model="notification.enabled"
                      class="sr-only peer"
                  >
                  <div class="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- 계정 설정 탭 -->
          <div v-if="activeTab === 'account'" class="p-6 space-y-6">
            <h3 class="text-xl font-bold text-zinc-900 mb-4 pb-2 border-b border-zinc-200">계정 설정</h3>

            <div class="space-y-4">
              <div class="flex items-center justify-between py-3 px-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <div class="text-left">
                  <h4 class="font-medium text-zinc-900">언어 설정</h4>
                  <p class="text-sm text-zinc-600">앱에서 사용할 언어를 선택하세요</p>
                </div>
                <select
                    v-model="userProfile.language"
                    class="px-4 py-2 rounded-2xl border-zinc-300 bg-zinc-100 focus:border-amber-500 focus:ring-amber-500"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                  <option value="zh">中文</option>
                </select>
              </div>

              <div class="flex items-center justify-between py-3 px-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <div class="text-left">
                  <h4 class="font-medium text-zinc-900">다크 모드</h4>
                  <p class="text-sm text-zinc-600">어두운 테마로 전환합니다</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                      type="checkbox"
                      v-model="userProfile.darkMode"
                      class="sr-only peer"
                  >
                  <div class="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                </label>
              </div>

              <div class="flex py-3 justify-between px-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <button class="text-red-600 hover:text-red-700 font-medium flex items-center">
                  <trash-icon class="w-4 h-4 mr-2" />
                  계정 삭제
                </button>
                <p class="text-right text-zinc-500 mt-1">계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.</p>
              </div>
            </div>
          </div>

          <!-- 저장 버튼 -->
          <div class="p-6 bg-zinc-50 rounded-b-lg border-t border-zinc-200">
            <div class="flex justify-end">
              <button
                  @click="saveChanges"
                  class="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-zinc-900 rounded-lg font-medium shadow-sm transition-colors duration-200"
              >
                변경사항 저장
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {
  User as UserIcon,
  Camera as CameraIcon,
  UserCircle as UserCircleIcon,
  Lock as LockIcon,
  Bell as BellIcon,
  Settings as SettingsIcon,
  Trash as TrashIcon
} from 'lucide-vue-next'

// 탭 메뉴 정의
const tabs = [
  {id: 'profile', name: '기본 정보', icon: UserCircleIcon},
  {id: 'password', name: '비밀번호 변경', icon: LockIcon},
  {id: 'notifications', name: '알림 설정', icon: BellIcon},
  {id: 'account', name: '계정 설정', icon: SettingsIcon}
]

// 활성 탭 상태
const activeTab = ref('profile')

// 파일 입력 참조
const fileInput = ref(null)

// 여행 스타일 목록
const travelStyles = [
  '자연 탐방', '문화 체험', '미식 여행', '쇼핑', '휴양', '모험', '역사 탐방', '축제', '로컬 체험'
]

// 사용자 프로필 데이터
const userProfile = ref({
  name: '김여행',
  nickname: '여행좋아',
  email: 'travel@example.com',
  bio: '여행을 좋아하는 평범한 직장인입니다. 주로 아시아 지역을 여행하며 현지 음식과 문화를 체험하는 것을 좋아합니다.',
  profileImage: null,
  travelStyles: ['미식 여행', '문화 체험', '로컬 체험'],
  language: 'ko',
  darkMode: false
})

// 비밀번호 변경 폼
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 알림 설정
const notificationSettings = ref([
  {
    title: '여행 일정 알림',
    description: '예정된 여행 일정에 대한 알림을 받습니다.',
    enabled: true
  },
  {
    title: '위시리스트 알림',
    description: '위시리스트 항목에 대한 정보와 추천을 받습니다.',
    enabled: true
  },
  {
    title: '마케팅 알림',
    description: '특별 프로모션 및 이벤트 정보를 받습니다.',
    enabled: false
  },
  {
    title: '이메일 알림',
    description: '알림을 이메일로도 받습니다.',
    enabled: true
  }
])

// 파일 입력 트리거
const triggerFileInput = () => {
  fileInput.value.click()
}

// 이미지 업로드 처리
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      userProfile.value.profileImage = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 여행 스타일 토글
const toggleTravelStyle = (style) => {
  const index = userProfile.value.travelStyles.indexOf(style)
  if (index === -1) {
    userProfile.value.travelStyles.push(style)
  } else {
    userProfile.value.travelStyles.splice(index, 1)
  }
}

// 변경사항 저장
const saveChanges = () => {
  // 여기에 API 호출 또는 저장 로직 구현
  alert('변경사항이 저장되었습니다.')
}
</script>

<style>
/* 폼 입력 필드 공통 스타일 */
input[type="text"],
input[type="email"],
input[type="password"],
textarea,
select {
  @apply px-3 py-2;
}

/* 토글 스위치 애니메이션 */
.peer:checked ~ .peer-checked\:after\:translate-x-full:after {
  transition: transform 0.2s ease-in-out;
}

/* 입력 필드 포커스 효과 강화 */
input:focus,
textarea:focus,
select:focus {
  @apply ring-2 ring-amber-400 ring-opacity-50;
  @apply border-amber-500;
}

/* 배경색 전환 애니메이션 */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>

