<template>
  <main class="min-h-screen bg-zinc-50">
    <section class="border-b border-zinc-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl">
            <p class="text-sm font-semibold text-amber-600">Tasting Notes</p>
            <h1 class="mt-2 text-3xl font-bold text-zinc-950 sm:text-4xl">테이스팅 노트</h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
              마신 술의 향, 맛, 여운, 페어링을 기록하고 다시 찾을 수 있습니다.
            </p>
          </div>
          <router-link
              :to="{ name: 'alcoholList' }"
              class="inline-flex w-fit items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-100"
          >
            술 둘러보기
          </router-link>
        </div>

        <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-4">
            <p class="text-xs font-semibold text-zinc-500">기록 수</p>
            <p class="mt-2 text-2xl font-bold text-zinc-950">{{ notes.length }}</p>
          </div>
          <div class="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-4">
            <p class="text-xs font-semibold text-zinc-500">평균 총점</p>
            <p class="mt-2 text-2xl font-bold text-zinc-950">{{ averageOverall }}</p>
          </div>
          <div class="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-4">
            <p class="text-xs font-semibold text-zinc-500">최근 테이스팅</p>
            <p class="mt-2 text-2xl font-bold text-zinc-950">{{ recentTastingDate }}</p>
          </div>
          <div class="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-4">
            <p class="text-xs font-semibold text-zinc-500">자주 남긴 표현</p>
            <div class="mt-2 flex min-h-8 flex-wrap items-center gap-2">
              <span
                  v-for="tag in topTags"
                  :key="tag"
                  class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800"
              >
                {{ tag }}
              </span>
              <span v-if="topTags.length === 0" class="text-sm font-semibold text-zinc-400">-</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:px-8">
      <form
          ref="formSection"
          class="rounded-md border border-zinc-200 bg-white p-5 shadow-sm"
          @submit.prevent="handleNoteSubmit"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-zinc-500">{{ editingId ? '노트 수정' : '새 노트' }}</p>
            <h2 class="mt-1 text-xl font-bold text-zinc-950">테이스팅 기록</h2>
          </div>
          <button
              v-if="editingId"
              type="button"
              class="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
              @click="resetForm"
          >
            <XMarkIcon class="h-4 w-4" aria-hidden="true" />
            취소
          </button>
        </div>

        <div class="mt-5 grid gap-2 sm:grid-cols-4" aria-label="테이스팅 기록 단계">
          <button
              v-for="step in noteSteps"
              :key="step.key"
              type="button"
              class="flex h-11 items-center gap-2 rounded-md border px-3 text-left text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              :class="activeNoteStep === step.key
                  ? 'border-zinc-950 bg-zinc-950 text-white'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'"
              :disabled="!canOpenNoteStep(step.key)"
              @click="goToNoteStep(step.key)"
          >
            <span
                class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
                :class="activeNoteStep === step.key ? 'bg-white text-zinc-950' : 'bg-zinc-100 text-zinc-600'"
            >
              {{ step.number }}
            </span>
            <span class="truncate">{{ step.label }}</span>
          </button>
        </div>

        <section v-if="activeNoteStep === 'alcohol'" class="mt-6 grid gap-5">
          <label class="block">
            <span class="text-sm font-semibold text-zinc-700">술 선택</span>
            <button
                type="button"
                class="mt-1 flex h-10 w-full items-center justify-between gap-3 rounded-md border border-zinc-300 bg-white px-3 text-left text-sm shadow-sm hover:bg-zinc-50 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                @click="openAlcoholModal"
            >
              <span class="truncate" :class="form.alcoholName ? 'text-zinc-950' : 'text-zinc-400'">
                {{ form.alcoholName || '직접 입력' }}
              </span>
              <MagnifyingGlassIcon class="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
            </button>
          </label>

          <label class="block">
            <span class="text-sm font-semibold text-zinc-700">술 이름</span>
            <input
                v-model.trim="form.alcoholName"
                type="text"
                class="mt-1 block w-full rounded-md border-zinc-300 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
                placeholder="예: 이강주"
                @input="handleAlcoholNameInput"
            />
          </label>

          <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                @click="resetForm"
            >
              <XMarkIcon class="h-4 w-4" aria-hidden="true" />
              초기화
            </button>
            <button
                type="button"
                :disabled="!canContinueFromAlcohol"
                class="inline-flex items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                @click="goToNoteStep('history')"
            >
              다음
            </button>
          </div>
        </section>

        <section v-else-if="activeNoteStep === 'history'" class="mt-6 grid gap-4">
          <div class="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p class="text-xs font-semibold text-zinc-500">선택한 술</p>
            <p class="mt-1 text-base font-bold text-zinc-950">{{ selectedAlcoholName }}</p>
          </div>

          <div v-if="selectedAlcoholPastNotes.length === 0" class="rounded-md border border-dashed border-zinc-300 px-4 py-10 text-center">
            <p class="text-sm font-semibold text-zinc-900">이 술의 이전 기록이 없습니다.</p>
          </div>
          <div v-else class="grid gap-3">
            <article
                v-for="note in selectedAlcoholPastNotes"
                :key="`selected-${note.id}`"
                class="rounded-md border border-zinc-200 px-4 py-3 text-left"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="min-w-0 flex-1 text-left">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="truncate text-sm font-bold text-zinc-950">{{ note.alcoholName }}</p>
                    <span class="rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                      총점 {{ note.overall }} / 5
                    </span>
                  </div>
                  <p class="mt-1 text-left text-sm text-zinc-500">
                    {{ formatDisplayDate(note.tastedAt) }}
                    <span v-if="note.place"> · {{ note.place }}</span>
                  </p>
                  <p v-if="note.memo" class="mt-2 line-clamp-2 text-left text-sm leading-6 text-zinc-700">{{ note.memo }}</p>
                </div>
                <button
                    type="button"
                    class="inline-flex shrink-0 items-center justify-center gap-1 rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                    @click="editNote(note)"
                >
                  <PencilSquareIcon class="h-4 w-4" aria-hidden="true" />
                  수정
                </button>
              </div>
            </article>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
                type="button"
                class="inline-flex items-center justify-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                @click="goToPreviousNoteStep"
            >
              이전
            </button>
            <button
                type="button"
                class="inline-flex items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                @click="goToNoteStep('details')"
            >
              새 기록 계속
            </button>
          </div>
        </section>

        <section v-else-if="activeNoteStep === 'details'" class="mt-6 grid gap-5">
          <div class="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p class="text-xs font-semibold text-zinc-500">선택한 술</p>
            <p class="mt-1 text-base font-bold text-zinc-950">{{ selectedAlcoholName }}</p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="text-sm font-semibold text-zinc-700">테이스팅 날짜</span>
              <input
                  v-model="form.tastedAt"
                  type="date"
                  class="mt-1 block w-full rounded-md border-zinc-300 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </label>

            <label class="block">
              <span class="text-sm font-semibold text-zinc-700">장소</span>
              <span class="mt-1 flex gap-2">
                <input
                    v-model.trim="form.place"
                    type="text"
                    class="block min-w-0 flex-1 rounded-md border-zinc-300 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    placeholder="예: 전주 여행"
                    @input="handlePlaceInput"
                />
                <button
                    type="button"
                    class="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                    @click="openPlacePicker"
                >
                  <MapPinIcon class="h-4 w-4" aria-hidden="true" />
                  지도
                </button>
              </span>
              <span v-if="hasSelectedPlaceCoordinates" class="mt-1 block text-xs text-zinc-500">
                {{ formatPlaceCoordinates(form.placeLat, form.placeLng) }}
              </span>
            </label>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
                type="button"
                class="inline-flex items-center justify-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                @click="goToPreviousNoteStep"
            >
              이전
            </button>
            <button
                type="button"
                class="inline-flex items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                @click="goToNoteStep('impressions')"
            >
              다음
            </button>
          </div>
        </section>

        <section v-else class="mt-6 grid gap-6">
          <p v-if="tagLoadError" class="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {{ tagLoadError }}
          </p>

          <div class="grid gap-4">
            <div
                v-for="field in ratingFields"
                :key="field.key"
                class="rounded-md border border-zinc-200 px-4 py-3"
            >
              <div class="flex items-center justify-between gap-3">
                <label :for="field.key" class="text-sm font-semibold text-zinc-800">{{ field.label }}</label>
                <span class="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-700">
                  {{ form[field.key] }} / 5
                </span>
              </div>
              <input
                  :id="field.key"
                  :value="form[field.key]"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  class="mt-3 w-full accent-amber-500"
                  @input="setRatingField(field.key, $event.target.value)"
              />
            </div>
          </div>

          <div class="grid gap-5">
            <div v-for="group in tagGroups" :key="group.field">
              <p class="text-sm font-semibold text-zinc-800">{{ group.label }}</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                    v-for="tag in group.options"
                    :key="tag"
                    type="button"
                    class="rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors"
                    :class="isTagSelected(group.field, tag)
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'"
                    @click="toggleTag(group.field, tag)"
                >
                  {{ tag }}
                </button>
              </div>
            </div>
          </div>

          <div class="grid gap-4">
            <label class="block">
              <span class="text-sm font-semibold text-zinc-700">페어링</span>
              <input
                  v-model.trim="form.pairing"
                  type="text"
                  :maxlength="TASTING_NOTE_TEXT_SECURITY_RULES.pairing.maxLength"
                  class="mt-1 block w-full rounded-md border-zinc-300 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="예: 전, 치즈, 과일"
              />
            </label>

            <label class="block">
              <span class="text-sm font-semibold text-zinc-700">메모</span>
              <textarea
                  v-model.trim="form.memo"
                  rows="5"
                  :maxlength="TASTING_NOTE_TEXT_SECURITY_RULES.memo.maxLength"
                  class="mt-1 block w-full rounded-md border-zinc-300 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="향, 첫 맛, 목넘김, 다시 마시고 싶은 상황을 기록하세요."
              ></textarea>
            </label>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
                type="button"
                class="inline-flex items-center justify-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                @click="goToPreviousNoteStep"
            >
              이전
            </button>
            <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                  type="button"
                  class="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                  @click="resetForm"
              >
                <XMarkIcon class="h-4 w-4" aria-hidden="true" />
                초기화
              </button>
              <button
                  type="submit"
                  class="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                <CheckIcon class="h-4 w-4" aria-hidden="true" />
                {{ editingId ? '수정 저장' : '노트 저장' }}
              </button>
            </div>
          </div>
        </section>

        <p v-if="formError" class="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ formError }}
        </p>
      </form>

      <div class="min-w-0">
        <div class="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-sm font-semibold text-zinc-500">저장된 노트</p>
              <h2 class="mt-1 text-xl font-bold text-zinc-950">내 테이스팅 기록</h2>
            </div>
            <label class="block sm:w-48">
              <span class="text-sm font-semibold text-zinc-700">정렬</span>
              <select
                  v-model="sortBy"
                  class="mt-1 block w-full rounded-md border-zinc-300 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
              >
                <option value="recent">최근순</option>
                <option value="score">총점순</option>
                <option value="name">이름순</option>
              </select>
            </label>
          </div>

          <label class="mt-4 block">
            <span class="text-sm font-semibold text-zinc-700">검색</span>
            <input
                v-model.trim="searchText"
                type="search"
                class="mt-1 block w-full rounded-md border-zinc-300 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
                placeholder="술 이름, 장소, 태그 검색"
            />
          </label>
        </div>

        <div v-if="filteredNotes.length === 0" class="mt-4 rounded-md border border-dashed border-zinc-300 bg-white px-5 py-12 text-center">
          <p class="text-base font-semibold text-zinc-900">저장된 테이스팅 노트가 없습니다.</p>
          <p class="mt-2 text-sm text-zinc-500">첫 잔의 향과 여운을 남겨보세요.</p>
        </div>

        <div v-else class="mt-4 grid gap-4">
          <article
              v-for="note in filteredNotes"
              :key="note.id"
              class="rounded-md border border-zinc-200 bg-white p-5 text-left shadow-sm"
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0 flex-1 text-left">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="truncate text-lg font-bold text-zinc-950">{{ note.alcoholName }}</h3>
                  <span class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                    총점 {{ note.overall }} / 5
                  </span>
                </div>
                <p class="mt-1 text-left text-sm text-zinc-500">
                  {{ formatDisplayDate(note.tastedAt) }}
                  <span v-if="note.place"> · {{ note.place }}</span>
                </p>
              </div>
              <div class="flex shrink-0 gap-2">
                <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                    @click="editNote(note)"
                >
                  <PencilSquareIcon class="h-4 w-4" aria-hidden="true" />
                  수정
                </button>
                <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    @click="deleteNote(note.id)"
                >
                  <TrashIcon class="h-4 w-4" aria-hidden="true" />
                  삭제
                </button>
              </div>
            </div>

            <div class="mt-4 grid gap-3 text-sm text-zinc-700 sm:grid-cols-4">
              <p><span class="font-semibold text-zinc-900">색/질감</span> {{ note.appearance }}</p>
              <p><span class="font-semibold text-zinc-900">향</span> {{ note.aroma }}</p>
              <p><span class="font-semibold text-zinc-900">맛</span> {{ note.palate }}</p>
              <p><span class="font-semibold text-zinc-900">여운</span> {{ note.finish }}</p>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <span
                  v-for="tag in getNoteTags(note)"
                  :key="`${note.id}-${tag}`"
                  class="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700"
              >
                {{ tag }}
              </span>
            </div>

            <p v-if="note.pairing" class="mt-4 text-left text-sm text-zinc-700">
              <span class="font-semibold text-zinc-950">페어링</span> {{ note.pairing }}
            </p>
            <p v-if="note.memo" class="mt-3 whitespace-pre-line text-left text-sm leading-6 text-zinc-700">
              {{ note.memo }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <div
          v-if="isAlcoholModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="alcohol-search-title"
          @click.self="closeAlcoholModal"
      >
        <div class="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-md bg-white text-left shadow-xl">
          <div class="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4">
            <h2 id="alcohol-search-title" class="text-lg font-bold text-zinc-950">술 선택</h2>
            <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                @click="closeAlcoholModal"
            >
              <XMarkIcon class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div class="border-b border-zinc-200 p-5">
            <label class="block">
              <span class="text-sm font-semibold text-zinc-700">검색</span>
              <span class="mt-1 flex h-10 items-center rounded-md border border-zinc-300 bg-white px-3 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500">
                <MagnifyingGlassIcon class="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
                <input
                    v-model="alcoholSearchText"
                    type="search"
                    class="h-full min-w-0 flex-1 border-0 px-2 text-sm outline-none focus:ring-0"
                    placeholder="술 이름 검색"
                    autofocus
                />
              </span>
            </label>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto p-2" @scroll="handleAlcoholResultScroll">
            <button
                type="button"
                class="flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm hover:bg-zinc-50"
                @click="clearAlcoholSelection"
            >
              <span>
                <span class="block font-semibold text-zinc-900">직접 입력</span>
                <span class="mt-0.5 block text-xs text-zinc-500">아래 술 이름 칸에 직접 적기</span>
              </span>
              <span v-if="!form.alcoholId" class="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">선택됨</span>
            </button>

            <div v-if="isLoadingAlcohols" class="px-3 py-8 text-center text-sm text-zinc-500">
              술 목록을 불러오는 중입니다.
            </div>
            <p v-else-if="alcoholLoadError" class="m-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {{ alcoholLoadError }}
            </p>
            <div v-else-if="alcohols.length === 0" class="px-3 py-8 text-center text-sm text-zinc-500">
              검색 결과가 없습니다.
            </div>
            <div v-else class="space-y-1">
              <button
                  v-for="alcohol in alcohols"
                  :key="alcohol.id"
                  type="button"
                  class="flex w-full items-center justify-between gap-3 rounded-md px-3 py-3 text-left hover:bg-zinc-50"
                  @click="selectAlcohol(alcohol)"
              >
                <span class="flex min-w-0 items-center gap-3">
                  <span class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                    <img
                        v-if="hasAlcoholImage(alcohol)"
                        :src="getAlcoholImageUrl(alcohol)"
                        :alt="alcohol.name"
                        class="h-full w-full object-cover"
                        @error="markAlcoholImageFailed(alcohol)"
                    />
                    <span v-else class="text-xs font-semibold text-zinc-400" aria-hidden="true">
                      {{ getAlcoholFallbackLabel(alcohol) }}
                    </span>
                  </span>
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-semibold text-zinc-950">{{ alcohol.name }}</span>
                    <span class="mt-1 block text-xs text-zinc-500">
                      {{ alcohol.strength ? `${alcohol.strength}%` : '-' }}
                      <span v-if="alcohol.size"> · {{ alcohol.size }}ml</span>
                    </span>
                  </span>
                </span>
                <span v-if="String(form.alcoholId) === String(alcohol.id)" class="shrink-0 rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">선택됨</span>
              </button>
              <div v-if="isLoadingMoreAlcohols" class="px-3 py-4 text-center text-sm text-zinc-500">
                술 목록을 더 불러오는 중입니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <PlaceMapPicker
        :is-open="isPlacePickerOpen"
        :initial-place-name="form.place"
        :initial-latitude="form.placeLat"
        :initial-longitude="form.placeLng"
        @close="closePlacePicker"
        @select="selectPlace"
    />
  </main>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import {CheckIcon, MagnifyingGlassIcon, MapPinIcon, PencilSquareIcon, TrashIcon, XMarkIcon} from '@heroicons/vue/24/outline';
import PlaceMapPicker from '@/components/PlaceMapPicker.vue';
import {apiService} from '@/services/api';
import {
  buildTastingNoteTagGroups,
  DEFAULT_TASTING_NOTE_TAG_GROUPS,
  TASTING_NOTE_RATING_FIELDS
} from '@/constants/tastingNotes';
import {
  normalizePlainTextInput,
  TASTING_NOTE_TEXT_SECURITY_RULES,
  validateTastingNoteTextFields
} from '@/utils/textInputSecurity';

const STORAGE_KEY = 'dripking:tasting-notes';
const ALCOHOL_SEARCH_PAGE_SIZE = 40;
const NOTE_STEP_KEYS = ['alcohol', 'history', 'details', 'impressions'];
const noteSteps = [
  {key: 'alcohol', number: 1, label: '술 선택'},
  {key: 'history', number: 2, label: '기존 기록'},
  {key: 'details', number: 3, label: '날짜/장소'},
  {key: 'impressions', number: 4, label: '평가'}
];
const DUMMY_ALCOHOL_NAME_PATTERN = /^(Alcohol|Perf Alcohol)\s+\d+$|^ZZZ Dummy Alcohol\s+\d+$/i;
const alcoholNameCollator = new Intl.Collator('ko-KR', {
  numeric: true,
  sensitivity: 'base'
});

const route = useRoute();
const formSection = ref(null);
const alcohols = ref([]);
const notes = ref([]);
const isLoadingAlcohols = ref(false);
const isLoadingMoreAlcohols = ref(false);
const hasMoreAlcohols = ref(false);
const isAlcoholModalOpen = ref(false);
const isPlacePickerOpen = ref(false);
const failedAlcoholImageIds = ref(new Set());
const alcoholSearchPage = ref(0);
const alcoholSearchText = ref('');
const alcoholLoadError = ref('');
const tagLoadError = ref('');
const formError = ref('');
const editingId = ref('');
const activeNoteStep = ref('alcohol');
const searchText = ref('');
const sortBy = ref('recent');

const today = () => new Date().toISOString().slice(0, 10);

const createBlankForm = () => ({
  alcoholId: '',
  alcoholName: '',
  tastedAt: today(),
  place: '',
  placeLat: null,
  placeLng: null,
  appearance: 3,
  aroma: 3,
  palate: 3,
  finish: 3,
  overall: 3,
  aromaTags: [],
  palateTags: [],
  finishTags: [],
  pairing: '',
  memo: ''
});

const form = ref(createBlankForm());

const ratingFields = TASTING_NOTE_RATING_FIELDS;
const tagGroups = ref(DEFAULT_TASTING_NOTE_TAG_GROUPS);

const createId = () => `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeNumber = (value, fallback = 3) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallback;
  return Math.min(5, Math.max(1, numericValue));
};

const normalizeOptionalCoordinate = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const normalizeTags = (tags) => Array.isArray(tags) ? tags.filter(Boolean) : [];

const normalizeComparableText = (value) => String(value || '').trim().toLowerCase();

const isDummyAlcohol = (alcohol) => DUMMY_ALCOHOL_NAME_PATTERN.test(String(alcohol?.name || '').trim());

const compareAlcoholForSelect = (firstAlcohol, secondAlcohol) => {
  const firstIsDummy = isDummyAlcohol(firstAlcohol);
  const secondIsDummy = isDummyAlcohol(secondAlcohol);

  if (firstIsDummy !== secondIsDummy) {
    return firstIsDummy ? 1 : -1;
  }

  return alcoholNameCollator.compare(firstAlcohol?.name || '', secondAlcohol?.name || '');
};

const getAlcoholImageUrl = (alcohol) => alcohol?.imgUrl || alcohol?.img_url || '';

const hasAlcoholImage = (alcohol) => {
  return Boolean(getAlcoholImageUrl(alcohol)) && !failedAlcoholImageIds.value.has(String(alcohol?.id));
};

const getAlcoholFallbackLabel = (alcohol) => {
  return String(alcohol?.name || '?').trim().slice(0, 1).toUpperCase() || '?';
};

const markAlcoholImageFailed = (alcohol) => {
  const nextFailedImageIds = new Set(failedAlcoholImageIds.value);
  nextFailedImageIds.add(String(alcohol?.id));
  failedAlcoholImageIds.value = nextFailedImageIds;
};

const normalizeAlcoholResponse = (response) => {
  return Array.isArray(response?.content)
      ? response.content
      : Array.isArray(response)
          ? response
          : [];
};

const hasNextAlcoholPage = (response, nextAlcohols, page) => {
  if (typeof response?.last === 'boolean') {
    return !response.last;
  }

  if (Number.isFinite(Number(response?.totalPages))) {
    return page + 1 < Number(response.totalPages);
  }

  return nextAlcohols.length === ALCOHOL_SEARCH_PAGE_SIZE;
};

const buildAlcoholListEndpoint = (keyword, page) => {
  const query = `page=${page}&size=${ALCOHOL_SEARCH_PAGE_SIZE}&sort=name,ASC`;
  return keyword
      ? `alcohols/search/${encodeURIComponent(keyword)}?${query}`
      : `alcohols?${query}`;
};

const mergeAlcoholResults = (currentAlcohols, nextAlcohols) => {
  const alcoholById = new Map(currentAlcohols.map((alcohol) => [String(alcohol.id), alcohol]));
  nextAlcohols.forEach((alcohol) => {
    alcoholById.set(String(alcohol.id), alcohol);
  });
  return [...alcoholById.values()].sort(compareAlcoholForSelect);
};

let alcoholSearchDebounceId = null;
let alcoholSearchRequestId = 0;

const normalizeNote = (note) => ({
  id: note.id || createId(),
  alcoholId: note.alcoholId ? String(note.alcoholId) : '',
  alcoholName: note.alcoholName || '',
  tastedAt: note.tastedAt || today(),
  place: note.place || '',
  placeLat: normalizeOptionalCoordinate(note.placeLat ?? note.placeLatitude ?? note.latitude),
  placeLng: normalizeOptionalCoordinate(note.placeLng ?? note.placeLongitude ?? note.longitude),
  appearance: normalizeNumber(note.appearance),
  aroma: normalizeNumber(note.aroma),
  palate: normalizeNumber(note.palate),
  finish: normalizeNumber(note.finish),
  overall: normalizeNumber(note.overall),
  aromaTags: normalizeTags(note.aromaTags),
  palateTags: normalizeTags(note.palateTags),
  finishTags: normalizeTags(note.finishTags),
  pairing: normalizePlainTextInput(note.pairing, TASTING_NOTE_TEXT_SECURITY_RULES.pairing),
  memo: normalizePlainTextInput(note.memo, TASTING_NOTE_TEXT_SECURITY_RULES.memo),
  createdAt: note.createdAt || new Date().toISOString(),
  updatedAt: note.updatedAt || note.createdAt || new Date().toISOString()
});

const persistNotes = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.value));
};

const loadNotes = () => {
  try {
    const savedNotes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    notes.value = Array.isArray(savedNotes) ? savedNotes.map(normalizeNote) : [];
  } catch (error) {
    console.error('테이스팅 노트를 불러오지 못했습니다.', error);
    notes.value = [];
  }
};

const loadAlcohols = async ({append = false} = {}) => {
  if (append && (!hasMoreAlcohols.value || isLoadingAlcohols.value || isLoadingMoreAlcohols.value)) {
    return;
  }

  const keyword = alcoholSearchText.value.trim();
  const page = append ? alcoholSearchPage.value + 1 : 0;
  const requestId = ++alcoholSearchRequestId;

  if (append) {
    isLoadingMoreAlcohols.value = true;
  } else {
    isLoadingAlcohols.value = true;
    alcoholLoadError.value = '';
    hasMoreAlcohols.value = false;
    alcoholSearchPage.value = 0;
  }

  try {
    const response = await apiService.get(buildAlcoholListEndpoint(keyword, page));
    if (requestId !== alcoholSearchRequestId) {
      return;
    }

    const nextAlcohols = normalizeAlcoholResponse(response);
    alcoholSearchPage.value = page;
    hasMoreAlcohols.value = hasNextAlcoholPage(response, nextAlcohols, page);
    alcohols.value = append
        ? mergeAlcoholResults(alcohols.value, nextAlcohols)
        : [...nextAlcohols].sort(compareAlcoholForSelect);
  } catch (error) {
    if (requestId !== alcoholSearchRequestId) {
      return;
    }

    console.error('술 목록을 불러오지 못했습니다.', error);
    if (!append) {
      alcohols.value = [];
    }
    alcoholLoadError.value = '술 목록을 불러오지 못했습니다. 이름은 직접 입력할 수 있습니다.';
  } finally {
    if (append) {
      isLoadingMoreAlcohols.value = false;
    } else {
      if (requestId === alcoholSearchRequestId) {
        isLoadingAlcohols.value = false;
      }
    }
  }
};

const loadTagGroups = async () => {
  tagLoadError.value = '';

  try {
    const response = await apiService.get('tags');
    tagGroups.value = buildTastingNoteTagGroups(Array.isArray(response) ? response : []);
  } catch (error) {
    console.error('테이스팅 태그를 불러오지 못했습니다.', error);
    tagGroups.value = DEFAULT_TASTING_NOTE_TAG_GROUPS;
    tagLoadError.value = '태그 목록을 불러오지 못했습니다. 기본 태그로 표시합니다.';
  }
};

const findAlcoholById = (alcoholId) => {
  return alcohols.value.find((alcohol) => String(alcohol.id) === String(alcoholId));
};

const syncAlcoholName = () => {
  const selectedAlcohol = findAlcoholById(form.value.alcoholId);
  if (selectedAlcohol) {
    form.value.alcoholName = selectedAlcohol.name;
  }
};

const selectedAlcoholName = computed(() => form.value.alcoholName.trim() || '직접 입력');

const canContinueFromAlcohol = computed(() => Boolean(form.value.alcoholName.trim()));

const hasSelectedPlaceCoordinates = computed(() => {
  return normalizeOptionalCoordinate(form.value.placeLat) !== null
      && normalizeOptionalCoordinate(form.value.placeLng) !== null;
});

const formatPlaceCoordinates = (lat, lng) => {
  const normalizedLat = normalizeOptionalCoordinate(lat);
  const normalizedLng = normalizeOptionalCoordinate(lng);
  if (normalizedLat === null || normalizedLng === null) {
    return '';
  }
  return `${normalizedLat.toFixed(6)}, ${normalizedLng.toFixed(6)}`;
};

const canOpenNoteStep = (stepKey) => {
  return stepKey === 'alcohol' || canContinueFromAlcohol.value;
};

const validateAlcoholStep = () => {
  if (canContinueFromAlcohol.value) {
    formError.value = '';
    return true;
  }

  activeNoteStep.value = 'alcohol';
  formError.value = '술을 선택하거나 술 이름을 입력해주세요.';
  return false;
};

const goToNoteStep = (stepKey) => {
  if (!NOTE_STEP_KEYS.includes(stepKey)) return;
  if (stepKey !== 'alcohol' && !validateAlcoholStep()) return;
  activeNoteStep.value = stepKey;
  formError.value = '';
};

const goToPreviousNoteStep = () => {
  const currentIndex = NOTE_STEP_KEYS.indexOf(activeNoteStep.value);
  if (currentIndex <= 0) return;
  activeNoteStep.value = NOTE_STEP_KEYS[currentIndex - 1];
  formError.value = '';
};

const goToNextNoteStep = () => {
  const currentIndex = NOTE_STEP_KEYS.indexOf(activeNoteStep.value);
  const nextStep = NOTE_STEP_KEYS[currentIndex + 1];
  if (nextStep) {
    goToNoteStep(nextStep);
  }
};

const handleAlcoholNameInput = () => {
  if (form.value.alcoholId) {
    form.value.alcoholId = '';
  }
};

const openAlcoholModal = () => {
  isAlcoholModalOpen.value = true;
  if (alcohols.value.length === 0) {
    loadAlcohols();
  }
};

const closeAlcoholModal = () => {
  isAlcoholModalOpen.value = false;
};

const selectAlcohol = (alcohol) => {
  form.value.alcoholId = String(alcohol.id);
  form.value.alcoholName = alcohol.name || '';
  closeAlcoholModal();
  goToNoteStep('history');
};

const clearAlcoholSelection = () => {
  form.value.alcoholId = '';
  form.value.alcoholName = '';
  closeAlcoholModal();
  activeNoteStep.value = 'alcohol';
};

const openPlacePicker = () => {
  isPlacePickerOpen.value = true;
};

const closePlacePicker = () => {
  isPlacePickerOpen.value = false;
};

const selectPlace = (place) => {
  form.value.place = place.name || '';
  form.value.placeLat = normalizeOptionalCoordinate(place.lat ?? place.latitude);
  form.value.placeLng = normalizeOptionalCoordinate(place.lng ?? place.longitude);
  closePlacePicker();
};

const handlePlaceInput = () => {
  form.value.placeLat = null;
  form.value.placeLng = null;
};

const handleAlcoholResultScroll = (event) => {
  const element = event.currentTarget;
  const remainingScroll = element.scrollHeight - element.scrollTop - element.clientHeight;
  if (remainingScroll < 120) {
    loadAlcohols({append: true});
  }
};

const applyRouteAlcohol = async () => {
  if (editingId.value || !route.query.alcoholId) return;

  form.value.alcoholId = String(route.query.alcoholId);
  syncAlcoholName();

  if (form.value.alcoholName) {
    activeNoteStep.value = 'history';
    return;
  }

  try {
    const alcohol = await apiService.get(`alcohols/${route.query.alcoholId}`);
    form.value.alcoholName = alcohol?.name || '';
    if (form.value.alcoholName) {
      activeNoteStep.value = 'history';
    }
  } catch (error) {
    console.error('선택한 술 정보를 불러오지 못했습니다.', error);
  }
};

const setRatingField = (fieldKey, value) => {
  form.value[fieldKey] = normalizeNumber(value);
};

const isTagSelected = (field, tag) => form.value[field].includes(tag);

const toggleTag = (field, tag) => {
  const selectedTags = form.value[field];
  form.value[field] = selectedTags.includes(tag)
      ? selectedTags.filter((selectedTag) => selectedTag !== tag)
      : [...selectedTags, tag];
};

const getNoteTags = (note) => [
  ...normalizeTags(note.aromaTags),
  ...normalizeTags(note.palateTags),
  ...normalizeTags(note.finishTags)
];

const selectedAlcoholPastNotes = computed(() => {
  const selectedAlcoholId = String(form.value.alcoholId || '');
  const selectedName = normalizeComparableText(form.value.alcoholName);

  if (!selectedAlcoholId && !selectedName) {
    return [];
  }

  return notes.value
      .filter((note) => {
        if (note.id === editingId.value) return false;
        const noteAlcoholId = String(note.alcoholId || '');
        const matchesId = selectedAlcoholId && noteAlcoholId && noteAlcoholId === selectedAlcoholId;
        const matchesName = selectedName && normalizeComparableText(note.alcoholName) === selectedName;
        return matchesId || matchesName;
      })
      .sort((firstNote, secondNote) => String(secondNote.tastedAt).localeCompare(String(firstNote.tastedAt)));
});

const saveNote = () => {
  formError.value = '';

  if (!form.value.alcoholName.trim()) {
    formError.value = '술 이름을 입력해주세요.';
    activeNoteStep.value = 'alcohol';
    return;
  }

  const textValidation = validateTastingNoteTextFields({
    pairing: form.value.pairing,
    memo: form.value.memo
  });

  if (!textValidation.isValid) {
    formError.value = textValidation.errors[0];
    activeNoteStep.value = 'impressions';
    return;
  }

  const now = new Date().toISOString();
  const existingNote = editingId.value
      ? notes.value.find((note) => note.id === editingId.value)
      : null;

  const nextNote = normalizeNote({
    ...form.value,
    ...textValidation.values,
    id: editingId.value || createId(),
    createdAt: existingNote?.createdAt || now,
    updatedAt: now
  });

  notes.value = editingId.value
      ? notes.value.map((note) => note.id === editingId.value ? nextNote : note)
      : [nextNote, ...notes.value];

  persistNotes();
  resetForm();
};

const handleNoteSubmit = () => {
  if (activeNoteStep.value !== 'impressions') {
    goToNextNoteStep();
    return;
  }

  saveNote();
};

const editNote = (note) => {
  editingId.value = note.id;
  form.value = {
    alcoholId: note.alcoholId,
    alcoholName: note.alcoholName,
    tastedAt: note.tastedAt,
    place: note.place,
    placeLat: normalizeOptionalCoordinate(note.placeLat),
    placeLng: normalizeOptionalCoordinate(note.placeLng),
    appearance: note.appearance,
    aroma: note.aroma,
    palate: note.palate,
    finish: note.finish,
    overall: note.overall,
    aromaTags: [...normalizeTags(note.aromaTags)],
    palateTags: [...normalizeTags(note.palateTags)],
    finishTags: [...normalizeTags(note.finishTags)],
    pairing: note.pairing,
    memo: note.memo
  };
  formError.value = '';
  activeNoteStep.value = 'details';
  formSection.value?.scrollIntoView({behavior: 'smooth', block: 'start'});
};

const deleteNote = (noteId) => {
  if (!window.confirm('이 테이스팅 노트를 삭제할까요?')) return;
  notes.value = notes.value.filter((note) => note.id !== noteId);
  persistNotes();

  if (editingId.value === noteId) {
    resetForm();
  }
};

const resetForm = () => {
  editingId.value = '';
  formError.value = '';
  activeNoteStep.value = 'alcohol';
  form.value = createBlankForm();
  applyRouteAlcohol();
};

const formatDisplayDate = (dateValue) => {
  if (!dateValue) return '-';
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const averageOverall = computed(() => {
  if (notes.value.length === 0) return '-';
  const total = notes.value.reduce((sum, note) => sum + normalizeNumber(note.overall), 0);
  return (total / notes.value.length).toFixed(1);
});

const recentTastingDate = computed(() => {
  if (notes.value.length === 0) return '-';
  const [latestNote] = [...notes.value].sort((a, b) => String(b.tastedAt).localeCompare(String(a.tastedAt)));
  return formatDisplayDate(latestNote.tastedAt);
});

const topTags = computed(() => {
  const tagCounts = new Map();
  notes.value.forEach((note) => {
    getNoteTags(note).forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return [...tagCounts.entries()]
      .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0], 'ko-KR'))
      .slice(0, 3)
      .map(([tag]) => tag);
});

const filteredNotes = computed(() => {
  const keyword = searchText.value.trim().toLowerCase();
  const nextNotes = [...notes.value].filter((note) => {
    if (!keyword) return true;
    return [
      note.alcoholName,
      note.place,
      note.pairing,
      note.memo,
      ...getNoteTags(note)
    ]
        .join(' ')
        .toLowerCase()
        .includes(keyword);
  });

  if (sortBy.value === 'score') {
    return nextNotes.sort((a, b) => normalizeNumber(b.overall) - normalizeNumber(a.overall));
  }

  if (sortBy.value === 'name') {
    return nextNotes.sort((a, b) => a.alcoholName.localeCompare(b.alcoholName, 'ko-KR'));
  }

  return nextNotes.sort((a, b) => String(b.tastedAt).localeCompare(String(a.tastedAt)));
});

watch(
    () => route.query.alcoholId,
    () => {
      applyRouteAlcohol();
    }
);

watch(alcoholSearchText, () => {
  if (!isAlcoholModalOpen.value) return;

  if (alcoholSearchDebounceId) {
    clearTimeout(alcoholSearchDebounceId);
  }

  alcoholSearchDebounceId = setTimeout(() => {
    loadAlcohols();
  }, 250);
});

onMounted(async () => {
  loadNotes();
  await Promise.all([
    loadAlcohols(),
    loadTagGroups()
  ]);
  await applyRouteAlcohol();
});

onBeforeUnmount(() => {
  if (alcoholSearchDebounceId) {
    clearTimeout(alcoholSearchDebounceId);
  }
});
</script>
