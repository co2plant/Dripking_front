<template>
  <div class="w-full max-w-md space-y-8">
    <!-- Toggle Buttons -->
    <div class="flex space-x-4 mb-8">
      <button
          @click="currentForm = 'login'"
          :class="[
          'flex-1 py-2 px-4 rounded-md font-medium transition-colors',
          currentForm === 'login'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        로그인
      </button>
      <button
          @click="currentForm = 'signup'"
          :class="[
          'flex-1 py-2 px-4 rounded-md font-medium transition-colors',
          currentForm === 'signup'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        회원가입
      </button>
    </div>

    <transition name="fade" mode="out-in">
      <!-- Login Form -->
      <form v-if="currentForm === 'login'" @submit.prevent="handleLogin" class="space-y-6" key="login">
        <div>
          <label for="login-email" class="block text-sm font-medium text-gray-700">이메일</label>
          <input
              id="login-email"
              v-model="loginForm.email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label for="login-password" class="block text-sm font-medium text-gray-700">비밀번호</label>
          <input
              id="login-password"
              v-model="loginForm.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
                id="remember-me"
                v-model="loginForm.rememberMe"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">로그인 상태 유지</label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-blue-600 hover:text-blue-500">비밀번호 찾기</a>
          </div>
        </div>

        <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

      <!-- signup Form -->
      <form v-else @submit.prevent="handleSignUp" class="space-y-6" key="signup">
        <div>
          <label for="signup-email" class="block text-sm font-medium text-gray-700">이메일</label>
          <input
              id="signup-email"
              v-model="signupForm.email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
        </div>

        <div>
          <label for="signup-password" class="block text-sm font-medium text-gray-700">비밀번호</label>
          <input
              id="signup-password"
              v-model="signupForm.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
        </div>

        <div>
          <label for="signup-confirm-password" class="block text-sm font-medium text-gray-700">비밀번호 확인</label>
          <input
              id="signup-confirm-password"
              v-model="signupForm.confirmPassword"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
        </div>

        <div>
          <label for="signup-nickname" class="block text-sm font-medium text-gray-700">닉네임</label>
          <input
              id="signup-nickname"
              v-model="signupForm.nickname"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p v-if="errors.nickname" class="mt-1 text-sm text-red-600">{{ errors.nickname }}</p>
        </div>

        <div class="flex items-center">
          <input
              id="agree-terms"
              v-model="signupForm.agreeToTerms"
              type="checkbox"
              required
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="agree-terms" class="ml-2 block text-sm text-gray-900">
            <span>이용약관 및 개인정보 처리방침에 동의합니다</span>
          </label>
        </div>

        <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {{ isLoading ? '가입 중...' : '회원가입' }}
        </button>
      </form>
    </transition>

    <!-- Error Message -->
    <div v-if="globalError" class="mt-4 text-center text-sm text-red-600">
      {{ globalError }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const currentForm = ref('login')
const isLoading = ref(false)
const globalError = ref('')

// 로그인 폼 상태
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// 회원가입 폼 상태
const signupForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  agreeToTerms: false
})

// 유효성 검사 에러
const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  nickname: ''
})

// 이메일 유효성 검사
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// 비밀번호 유효성 검사
const validatePassword = (password) => {
  return password.length >= 8
}

// 회원가입 폼 유효성 검사
const validatesignupForm = () => {
  let isValid = true
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.nickname = ''

  if (!validateEmail(signupForm.email)) {
    errors.email = '유효한 이메일 주소를 입력해주세요.'
    isValid = false
  }

  if (!validatePassword(signupForm.password)) {
    errors.password = '비밀번호는 16자 이상이어야 합니다.'
    isValid = false
  }

  if (signupForm.password !== signupForm.confirmPassword) {
    errors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    isValid = false
  }

  if (!signupForm.nickname.trim()) {
    errors.nickname = '닉네임을 입력해주세요.'
    isValid = false
  }

  return isValid
}

// 로그인 처리
const handleLogin = async () => {
  try {
    isLoading.value = true
    globalError.value = ''

    // 여기에 실제 로그인 API 호출 로직을 구현합니다
    await new Promise(resolve => setTimeout(resolve, 1000)) // 임시 지연

    console.log('로그인 시도:', loginForm)

  } catch (error) {
    globalError.value = '로그인에 실패했습니다. 다시 시도해주세요.'
    console.error('로그인 에러:', error)
  } finally {
    isLoading.value = false
  }
}

// 회원가입 처리
const handleSignUp = async () => {
  try {
    if (!validatesignupForm()) {
      return
    }

    isLoading.value = true
    globalError.value = ''

    const response = await fetch('http://localhost:8080/api/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signupForm)
    })

    console.log('회원가입 시도:', signupForm)
    if(!response.ok){
      throw new Error('회원가입에 실패했습니다.')
    }

    // 성공 시 로그인 폼으로 전환
    currentForm.value = 'login'

  } catch (error) {
    globalError.value = '회원가입에 실패했습니다. 다시 시도해주세요.'
    console.error('회원가입 에러:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
