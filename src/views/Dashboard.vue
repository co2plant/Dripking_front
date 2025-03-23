<template>
  <div class="flex min-h-screen flex-col space-y-6">
    <div class="container grid flex-1 gap-12">
      <main class="flex w-full flex-1 flex-col overflow-hidden">
        <div class="flex flex-col gap-4 md:gap-6">
          <div class="grid gap-1">
            <h1 class="text-2xl font-bold tracking-tight">대시보드</h1>
            <p class="text-zinc-500 dark:text-zinc-400">관리자 대시보드에 오신 것을 환영합니다.</p>
          </div>
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div v-for="(stat, index) in stats" :key="index" class="rounded-lg border bg-white p-4 shadow-sm dark:bg-zinc-950">
              <div class="flex flex-row items-center justify-between space-y-0 pb-2">
                <p class="text-sm font-medium">{{ stat.title }}</p>
                <component :is="stat.icon" class="h-4 w-4 text-amber-600 dark:text-amber-500" />
              </div>
              <div class="text-2xl font-bold">{{ stat.value }}</div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">
                {{ stat.description }}
              </p>
            </div>
          </div>
          <div class="mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <div class="rounded-lg border bg-white shadow-sm dark:bg-zinc-950">
              <div class="p-6">
                <h2 class="font-semibold">최근 활동</h2>
                <p class="text-sm text-zinc-500 dark:text-zinc-400">관리자 활동 내역</p>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div v-for="(activity, index) in activities" :key="index" class="flex items-center gap-4">
                    <div class="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                      <span class="font-medium text-amber-700 dark:text-amber-300">
                        {{ activity.user.charAt(0) }}
                      </span>
                    </div>
                    <div class="space-y-1">
                      <p class="text-sm font-medium leading-none">
                        {{ activity.user }}
                      </p>
                      <p class="text-sm text-zinc-500 dark:text-zinc-400">
                        {{ activity.action }}
                      </p>
                    </div>
                    <div class="ml-auto text-sm text-zinc-500 dark:text-zinc-400">
                      {{ activity.time }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { Users, Map, Plane, Activity } from 'lucide-vue-next';

const stats = [
  {
    title: "총 사용자",
    value: "2,853",
    icon: Users,
    description: "지난 달 대비 +12%",
  },
  {
    title: "목적지",
    value: "432",
    icon: Map,
    description: "지난 달 대비 +5%",
  },
  {
    title: "여행",
    value: "1,257",
    icon: Plane,
    description: "지난 달 대비 +18%",
  },
  {
    title: "활성 여행",
    value: "274",
    icon: Activity,
    description: "지난 달 대비 +7%",
  },
];

const activities = [
  {
    user: "김민수",
    action: "새 사용자 등록",
    time: "10분 전",
  },
  {
    user: "이지은",
    action: "목적지 정보 수정",
    time: "25분 전",
  },
  {
    user: "박준호",
    action: "여행 일정 추가",
    time: "1시간 전",
  },
  {
    user: "최유진",
    action: "사용자 정보 업데이트",
    time: "2시간 전",
  },
  {
    user: "정다운",
    action: "목적지 삭제",
    time: "3시간 전",
  },
];
</script>