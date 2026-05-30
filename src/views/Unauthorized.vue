<template>
  <main class="min-h-[60vh] bg-white px-4 py-20">
    <section class="mx-auto max-w-xl border border-zinc-200 bg-zinc-50 px-6 py-10 text-center shadow-sm">
      <p class="text-sm font-semibold text-amber-700">403</p>
      <h1 class="mt-3 text-2xl font-bold text-zinc-950">권한이 필요합니다</h1>
      <p class="mt-4 text-sm leading-6 text-zinc-600">{{ message }}</p>
      <div class="mt-8 flex justify-center gap-3">
        <RouterLink
            to="/"
            class="inline-flex items-center justify-center bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          홈으로 이동
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup>
import {computed} from 'vue'
import {useRoute} from 'vue-router'

const route = useRoute()

const message = computed(() => {
  if (route.query.reason === 'admin') {
    return '관리자 권한이 있는 계정으로 접근해주세요.'
  }
  if (route.query.reason === 'login') {
    return '로그인 후 다시 시도해주세요.'
  }
  return '현재 계정으로는 이 페이지를 열 수 없습니다.'
})
</script>
