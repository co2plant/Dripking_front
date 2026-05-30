<template>
  <main class="min-h-[60vh] bg-white px-4 py-20">
    <section class="mx-auto max-w-xl border border-zinc-200 bg-zinc-50 px-6 py-10 text-center shadow-sm">
      <p class="text-sm font-semibold text-zinc-500">404</p>
      <h1 class="mt-3 text-2xl font-bold text-zinc-950">페이지를 찾을 수 없습니다</h1>
      <p class="mt-4 text-sm leading-6 text-zinc-600">
        요청한 주소가 없거나 이동되었습니다.
      </p>
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
