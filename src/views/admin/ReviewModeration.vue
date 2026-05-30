<template>
  <main class="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-8 text-left">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold tracking-tight text-zinc-950">리뷰 신고 관리</h1>
      <p class="text-sm text-zinc-500">신고된 리뷰를 확인하고 공개 상태를 조정합니다.</p>
    </header>

    <section class="flex flex-col gap-3 border-b border-zinc-200 pb-4 md:flex-row md:items-center md:justify-between">
      <div class="inline-flex w-fit rounded-md border border-zinc-200 bg-white p-1">
        <button
            v-for="option in statusOptions"
            :key="option.value"
            type="button"
            @click="setStatusFilter(option.value)"
            :class="[
              'rounded px-3 py-1.5 text-sm font-medium',
              statusFilter === option.value
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            ]"
        >
          {{ option.label }}
        </button>
      </div>
      <button
          type="button"
          @click="fetchReports(currentPage)"
          class="inline-flex w-fit items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
      >
        <RefreshCw class="mr-2 h-4 w-4" />
        새로고침
      </button>
    </section>

    <p v-if="message" class="text-sm" :class="messageType === 'error' ? 'text-red-600' : 'text-green-700'">
      {{ message }}
    </p>

    <section class="overflow-hidden rounded-md border border-zinc-200 bg-white">
      <div v-if="isLoading" class="px-4 py-12 text-center text-sm text-zinc-500">
        신고 내역을 불러오는 중입니다.
      </div>
      <div v-else-if="reports.length === 0" class="px-4 py-12 text-center text-sm text-zinc-500">
        표시할 신고 내역이 없습니다.
      </div>
      <table v-else class="w-full table-fixed">
        <thead class="border-b border-zinc-200 bg-zinc-50">
        <tr>
          <th class="w-24 px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">상태</th>
          <th class="w-40 px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">대상</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">리뷰</th>
          <th class="w-44 px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">신고자</th>
          <th class="w-36 px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">신고일</th>
          <th class="w-60 px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">작업</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="report in reports" :key="report.id" class="border-b border-zinc-100 last:border-0">
          <td class="px-4 py-4 align-top">
            <span
                class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                :class="report.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-700'"
            >
              {{ report.status === 'OPEN' ? '열림' : '완료' }}
            </span>
          </td>
          <td class="px-4 py-4 align-top text-sm text-zinc-700">
            <div class="font-medium text-zinc-950">{{ displayItemType(report.itemType) }}</div>
            <div class="mt-1 text-xs text-zinc-500">ID {{ report.targetId }}</div>
            <div class="mt-1 text-xs" :class="reviewStatusClass(report.reviewStatus)">
              {{ displayReviewStatus(report.reviewStatus) }}
            </div>
          </td>
          <td class="px-4 py-4 align-top">
            <div class="flex items-center gap-2 text-sm font-medium text-zinc-950">
              <span>{{ report.authorNickname || '알 수 없음' }}</span>
              <span class="text-xs text-zinc-400">평점 {{ report.rating ?? '-' }}</span>
            </div>
            <p class="mt-2 line-clamp-3 text-sm leading-6 text-zinc-700">{{ report.contents || '내용이 없습니다.' }}</p>
            <p v-if="report.reason || report.memo" class="mt-2 text-xs text-zinc-500">
              {{ report.reason || report.memo }}
            </p>
          </td>
          <td class="px-4 py-4 align-top text-sm text-zinc-700">
            <div>{{ report.reporterNickname || '알 수 없음' }}</div>
            <div class="mt-1 text-xs text-zinc-500">ID {{ report.reporterUserId }}</div>
          </td>
          <td class="px-4 py-4 align-top text-sm text-zinc-600">
            {{ formatDate(report.createdAt) }}
          </td>
          <td class="px-4 py-4 align-top">
            <div class="flex justify-end gap-2">
              <button
                  type="button"
                  @click="resolveReport(report.id)"
                  :disabled="report.status !== 'OPEN' || activeActionId === report.id"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                  title="신고 해결"
              >
                <CheckCircle class="h-4 w-4" />
              </button>
              <button
                  type="button"
                  @click="hideReview(report)"
                  :disabled="report.reviewStatus !== 'VISIBLE' || activeActionId === report.id"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                  title="리뷰 숨김"
              >
                <EyeOff class="h-4 w-4" />
              </button>
              <button
                  type="button"
                  @click="deleteReview(report)"
                  :disabled="report.reviewStatus === 'DELETED' || activeActionId === report.id"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40"
                  title="리뷰 삭제"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </section>

    <nav class="flex items-center justify-end gap-2">
      <button
          type="button"
          @click="fetchReports(currentPage - 1)"
          :disabled="currentPage <= 0 || isLoading"
          class="rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
      >
        이전
      </button>
      <span class="text-sm text-zinc-500">{{ currentPage + 1 }} / {{ Math.max(totalPages, 1) }}</span>
      <button
          type="button"
          @click="fetchReports(currentPage + 1)"
          :disabled="currentPage + 1 >= totalPages || isLoading"
          class="rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
      >
        다음
      </button>
    </nav>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { CheckCircle, EyeOff, RefreshCw, Trash2 } from 'lucide-vue-next';
import { apiService } from '@/services/api';

const reports = ref([]);
const currentPage = ref(0);
const totalPages = ref(0);
const pageSize = 10;
const isLoading = ref(false);
const activeActionId = ref(null);
const statusFilter = ref('OPEN');
const message = ref('');
const messageType = ref('success');

const statusOptions = [
  { value: 'OPEN', label: '열림' },
  { value: 'RESOLVED', label: '완료' },
  { value: '', label: '전체' },
];

const buildEndpoint = (page) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(pageSize),
  });
  if (statusFilter.value) {
    params.set('status', statusFilter.value);
  }
  return `admin/review-reports?${params.toString()}`;
};

const fetchReports = async (page = 0) => {
  isLoading.value = true;
  message.value = '';
  try {
    const response = await apiService.getWithToken(buildEndpoint(page));
    reports.value = response?.content || [];
    currentPage.value = response?.number ?? page;
    totalPages.value = response?.totalPages ?? 0;
  } catch (error) {
    console.error('Review report fetch failed:', error);
    reports.value = [];
    showMessage('신고 내역을 불러오지 못했습니다.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const setStatusFilter = async (nextStatus) => {
  statusFilter.value = nextStatus;
  await fetchReports(0);
};

const resolveReport = async (reportId) => {
  await runAction(reportId, async () => {
    await apiService.postWithToken(`admin/review-reports/${reportId}/resolve`, {});
    showMessage('신고를 해결 처리했습니다.');
  });
};

const hideReview = async (report) => {
  await runAction(report.id, async () => {
    await apiService.postWithToken(`admin/reviews/${report.reviewId}/hide`, {});
    showMessage('리뷰를 숨김 처리했습니다.');
  });
};

const deleteReview = async (report) => {
  if (!window.confirm('이 리뷰를 삭제 상태로 변경하시겠습니까?')) {
    return;
  }
  await runAction(report.id, async () => {
    await apiService.deleteWithToken(`admin/reviews/${report.reviewId}`);
    showMessage('리뷰를 삭제 상태로 변경했습니다.');
  });
};

const runAction = async (reportId, action) => {
  activeActionId.value = reportId;
  message.value = '';
  try {
    await action();
    await fetchReports(currentPage.value);
  } catch (error) {
    console.error('Review moderation action failed:', error);
    showMessage('작업을 완료하지 못했습니다.', 'error');
  } finally {
    activeActionId.value = null;
  }
};

const showMessage = (nextMessage, type = 'success') => {
  message.value = nextMessage;
  messageType.value = type;
};

const displayItemType = (itemType) => {
  const labels = {
    ALCOHOL: '술',
    DISTILLERY: '양조장',
    DESTINATION: '여행지',
  };
  return labels[itemType] || itemType || '-';
};

const displayReviewStatus = (status) => {
  const labels = {
    VISIBLE: '공개',
    HIDDEN: '숨김',
    DELETED: '삭제',
  };
  return labels[status] || status || '공개';
};

const reviewStatusClass = (status) => {
  if (status === 'HIDDEN') return 'text-amber-700';
  if (status === 'DELETED') return 'text-red-700';
  return 'text-green-700';
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  fetchReports();
});
</script>
