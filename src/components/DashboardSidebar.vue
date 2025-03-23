<template>
  <nav class="fixed top-0 z-30 flex h-screen w-56 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
    <div class="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
      <router-link to="/" class="flex items-center gap-2 font-semibold">
        <span class="text-amber-600 dark:text-amber-500">관리자</span>
        <span>대시보드</span>
      </router-link>
    </div>
    <div class="flex-1 overflow-auto py-4">
      <div class="grid gap-1 px-2">
        <router-link
            v-for="item in items"
            :key="item.path"
            :to="item.path"
            :class="[
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800',
            $route.path === item.path
              ? 'bg-amber-50 text-amber-600 hover:bg-amber-50 dark:bg-amber-950/50 dark:text-amber-500 dark:hover:bg-amber-950/50'
              : 'text-zinc-500 dark:text-zinc-400'
          ]"
        >
          <component :is="item.icon" class="h-4 w-4" />
          <span>{{ item.title }}</span>
        </router-link>
      </div>
    </div>
    <div class="border-t border-zinc-200 p-4 dark:border-zinc-800">
      <button class="flex w-full items-center justify-start rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium dark:border-zinc-800">
        <LogOut class="mr-2 h-4 w-4" />
        로그아웃
      </button>
    </div>
  </nav>
</template>

<script setup>
import { LayoutDashboard, Users, Map, Plane, LogOut } from 'lucide-vue-next';

const items = [
  {
    path: '/',
    title: '대시보드',
    icon: LayoutDashboard,
  },
  {
    path: '/users',
    title: '사용자',
    icon: Users,
  },
  {
    path: '/destinations',
    title: '목적지',
    icon: Map,
  },
  {
    path: '/trips',
    title: '여행',
    icon: Plane,
  },
];
</script>