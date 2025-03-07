<template>
  <div class="w-full max-w-md space-y-8">
    <!-- Toggle Buttons -->
    <div class="flex space-x-4 mb-8">
      <button
          @click="currentForm = 'signIn'"
          :class="[
          'flex-1 py-2 px-4 rounded-md font-medium transition-colors',
          currentForm === 'signIn'
            ? 'bg-amber-400 text-white'
            : 'bg-zinc-200 hover:bg-zinc-300 focus:ring-zinc-600 text-zinc-700'
        ]"
      >
        로그인
      </button>
      <button
          @click="currentForm = 'signup'"
          :class="[
          'flex-1 py-2 px-4 rounded-md font-medium transition-colors',
          currentForm === 'signup'
            ? 'bg-amber-400 text-white'
            : 'bg-zinc-200 hover:bg-zinc-300 focus:ring-zinc-600 text-zinc-700'
        ]"
      >
        회원가입
      </button>
    </div>

    <transition name="fade" mode="out-in">
      <!-- signIn Form -->
      <form v-if="currentForm === 'signIn'" @submit.prevent="handleSignIn" class="space-y-6" key="signIn">
        <div>
          <label for="signIn-email" class="block text-sm font-medium text-zinc-700">이메일</label>
          <input
              id="signIn-email"
              v-model="signInForm.email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div>
          <label for="signIn-password" class="block text-sm font-medium text-zinc-700">비밀번호</label>
          <input
              id="signIn-password"
              v-model="signInForm.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
                id="remember-me"
                v-model="signInForm.rememberMe"
                type="checkbox"
                class="h-4 w-4 text-amber-600 focus:ring-amber-500 border-zinc-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-zinc-900">로그인 상태 유지</label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-amber-600 hover:text-amber-500">비밀번호 찾기</a>
          </div>
        </div>

        <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-400 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
        >
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

      <!-- signup Form -->
      <form v-else @submit.prevent="handleSignUp" class="space-y-6" key="signup">
        <div>
          <label for="signup-email" class="block text-sm font-medium text-zinc-700">이메일</label>
          <input
              id="signup-email"
              v-model="SignUpForm.email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
        </div>

        <div>
          <label for="signup-password" class="block text-sm font-medium text-zinc-700">비밀번호</label>
          <input
              id="signup-password"
              v-model="SignUpForm.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
        </div>

        <div>
          <label for="signup-confirm-password" class="block text-sm font-medium text-zinc-700">비밀번호 확인</label>
          <input
              id="signup-confirm-password"
              v-model="SignUpForm.confirmPassword"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
          />
          <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
        </div>

        <div>
          <label for="signup-nickname" class="block text-sm font-medium text-zinc-700">닉네임</label>
          <input
              id="signup-nickname"
              v-model="SignUpForm.nickname"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
          />
          <p v-if="errors.nickname" class="mt-1 text-sm text-red-600">{{ errors.nickname }}</p>
        </div>

        <div class="flex items-center">
          <input
              id="agree-terms"
              v-model="SignUpForm.agreeToTerms"
              type="checkbox"
              required
              class="h-4 w-4 text-amber-600 focus:ring-amber-500 border-zinc-300 rounded"
          />
          <label for="agree-terms" class="ml-2 block text-sm text-zinc-900">
            <span>이용약관 및 개인정보 처리방침에 동의합니다</span>
          </label>
        </div>

        <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-400 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
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
import router from "@/router";

const currentForm = ref('signIn')
const isLoading = ref(false)
const globalError = ref('')

// 로그인 폼 상태
const signInForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// 회원가입 폼 상태
const SignUpForm = reactive({
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
  return password.length >= 16
}

// 회원가입 폼 유효성 검사
const validateSignUpForm = () => {
  let isValid = true
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.nickname = ''

  if (!validateEmail(SignUpForm.email)) {
    errors.email = '유효한 이메일 주소를 입력해주세요.'
    isValid = false
  }

  if (!validatePassword(SignUpForm.password)) {
    errors.password = '비밀번호는 16자 이상이어야 합니다.'
    isValid = false
  }

  if (SignUpForm.password !== SignUpForm.confirmPassword) {
    errors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    isValid = false
  }

  if (!SignUpForm.nickname.trim()) {
    errors.nickname = '닉네임을 입력해주세요.'
    isValid = false
  }

  return isValid
}

// 로그인 처리
const handleSignIn = async () => {
  try {
    isLoading.value = true
    globalError.value = ''

    // 여기에 실제 로그인 API 호출 로직을 구현합니다
    const response = await fetch('http://localhost:8080/api/user/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signInForm)
    })

    if(!response.ok){
      throw new Error('로그인에 실패했습니다.')
    }

    localStorage.setItem('Authorization', response.headers.get('Authorization'))
    router.go(0)
  } catch (error) {
    globalError.value = '로그인에 실패했습니다. 다시 시도해주세요.'
  } finally {
    isLoading.value = false
  }
}

// 회원가입 처리
const handleSignUp = async () => {
  try {
    if (!validateSignUpForm()) {
      return
    }

    isLoading.value = true
    globalError.value = ''

    const response = await fetch('http://localhost:8080/api/user/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(SignUpForm)
    })

    if(!response.ok){
      throw new Error('회원가입에 실패했습니다.')
    }

    // 성공 시 로그인 폼으로 전환
    currentForm.value = 'signIn'

  } catch (error) {
    globalError.value = '회원가입에 실패했습니다. 다시 시도해주세요.'
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
