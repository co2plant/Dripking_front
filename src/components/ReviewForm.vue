<template>
  <div class="relative">
    <Modal :show="showAuthModal" @close="showAuthModal = false">
      <AuthenticationForm />
    </Modal>
    <div class="bg-white rounded-lg p-6 mb-4 shadow-sm w-full">
      <h2 class="text-xl font-semibold mb-4">{{ isEditing ? '리뷰 수정' : '리뷰 작성' }}</h2>
      <form @submit.prevent="submitReview">
        <div class="mb-4">
          <label for="rating" class="block text-sm font-medium text-gray-700">평점</label>
          <div class="flex items-center">
            <template v-for="i in 5" :key="i">
              <svg
                  @click="setRating(i)"
                  class="w-6 h-6 cursor-pointer"
                  :class="i <= rating ? 'text-yellow-400' : 'text-gray-300'"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </template>
          </div>
        </div>
        <div class="mb-4">
          <label for="content" class="block text-sm font-medium text-gray-700">리뷰 내용</label>
          <textarea
              id="content"
              v-model="content"
              rows="4"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
          ></textarea>
        </div>
        <div class="flex justify-end">
          <button
              type="submit"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {{ isEditing ? '수정하기' : '작성하기' }}
          </button>
        </div>
      </form>
    </div>
    <!-- Blur Overlay for Non-logged in Users -->
    <div
        v-if="!isAuthenticated"
        class="absolute inset-0 backdrop-blur-md bg-white/30 rounded-lg flex flex-col items-center justify-center gap-4 z-10"
    >
      <p class="text-lg font-medium text-zinc-900">리뷰를 작성하려면 로그인이 필요합니다</p>
      <div class="flex gap-4">
        <div v-if="!isAuthenticated" class="hidden lg:flex lg:flex-1 lg:justify-end">
          <button
              @click="showAuthModal = true"
              class="justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-400 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            로그인 / 회원가입
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, defineProps, defineEmits, onMounted} from 'vue'
import Modal from "@/components/Modal.vue";
import AuthenticationForm from "@/components/Authentication/AuthenticationForm.vue";

const props = defineProps({
  targetId: {
    type: String,
    required: true
  },
  reviewType: {
    type: String,
    required: true
  },
  reviewToEdit: {
    type: Object,
    default: null
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['reviewSubmitted'])

const rating = ref(props.reviewToEdit ? props.reviewToEdit.rating : 0)
const content = ref(props.reviewToEdit ? props.reviewToEdit.contents : '')
const isEditing = ref(!!props.reviewToEdit)

const setRating = (value) => {
  rating.value = value
}

const submitReview = async () => {
  const reviewData = {
    targetId: props.targetId,
    reviewType: props.reviewType,
    rating: rating.value,
    contents: content.value
  }

  try {
    const url = isEditing.value
        ? `http://localhost:8080/api/reviews/${props.reviewToEdit.id}`
        : 'http://localhost:8080/api/reviews'

    const method = isEditing.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    })

    if (!response.ok) {
      throw new Error('리뷰 제출에 실패했습니다.')
    }

    // 폼 초기화
    rating.value = 0
    content.value = ''
    isEditing.value = false

    // 부모 컴포넌트에 리뷰가 제출되었음을 알림
    emit('reviewSubmitted')
  } catch (error) {
    console.error('리뷰 제출 중 오류 발생:', error)
    // 에러 처리 로직 추가
  }
}

const isAuthenticated = ref(false);

const checkAuth = async () => {
  try{
    const response = await fetch('http://localhost:8080/api/user/status', {
      method: 'GET',
      mode:'cors',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${localStorage.getItem('Authorization')}`
      },
    })

    if(response.ok){
      isAuthenticated.value = true;
    }

    console.log(isAuthenticated.value);
  }
  catch(e){
    console.error(e);
  }
}

onMounted(() => {
  checkAuth()
})

const showAuthModal = ref(false)
</script>