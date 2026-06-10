<template>
  <footer class="border-t border-zinc-200 bg-white">
    <div class="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="grid gap-8 text-left md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <router-link to="/" class="inline-flex items-center">
            <img src="../assets/Dripking_logo.png" class="h-9 w-auto" alt="Dripking" />
          </router-link>
          <p class="mt-4 max-w-md text-sm leading-6 text-zinc-600">
            전통주와 양조장, 여행지를 탐색하고 저장한 장소로 여행 계획을 만드는 서비스입니다.
          </p>
        </div>

        <div>
          <p class="text-sm font-semibold text-zinc-900">탐색</p>
          <nav class="mt-4 flex flex-col gap-3 text-sm text-zinc-600" aria-label="탐색 링크">
            <router-link class="hover:text-zinc-950" to="/destinationList">여행지</router-link>
            <router-link class="hover:text-zinc-950" to="/distilleryList">양조장</router-link>
            <router-link class="hover:text-zinc-950" to="/alcoholList">술</router-link>
            <router-link class="hover:text-zinc-950" to="/trips/new">여행 만들기</router-link>
          </nav>
        </div>

        <div>
          <p class="text-sm font-semibold text-zinc-900">계정</p>
          <nav class="mt-4 flex flex-col gap-3 text-sm text-zinc-600" aria-label="계정 링크">
            <router-link class="hover:text-zinc-950" to="/editUserDetail">내 정보 수정</router-link>
          </nav>
        </div>
      </div>

      <div class="mt-10 border-t border-zinc-200 pt-6 text-xs text-zinc-500">
        <p>&copy; 2026 Dripking. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>
