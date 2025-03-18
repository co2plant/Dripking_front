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
} from 'lucide-vue-next'

// 탭 메뉴 정의
const tabs = [
  {id: 'profile', name: '기본 정보', icon: UserCircleIcon},
  {id: 'password', name: '비밀번호 변경', icon: LockIcon}
]

// 활성 탭 상태
const activeTab = ref('profile')

// 파일 입력 참조
const fileInput = ref(null)

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

