<template>
  <div class="w-full max-w-4xl mx-auto">
    <div class="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{{ title }}</h2>
        <p class="text-zinc-500 dark:text-zinc-400">{{ description }}</p>
      </div>

      <!-- 알림 메시지 -->
      <div v-if="showAlert" :class="`mb-6 p-4 rounded-md ${alertClass}`">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <CheckCircle v-if="alertType === 'success'" class="h-5 w-5 text-green-400" />
            <AlertCircle v-else class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 :class="`text-sm font-medium ${alertTextClass}`">{{ alertTitle }}</h3>
            <div :class="`mt-1 text-sm ${alertTextClass}`">
              <p>{{ alertMessage }}</p>
            </div>
          </div>
        </div>
      </div>

      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- 동적 폼 필드 렌더링 -->
        <div v-for="field in fields" :key="field.name" class="space-y-2">
          <label :for="field.name" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500">*</span>
          </label>

          <!-- 텍스트 입력 -->
          <input
              v-if="field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'password'"
              :type="field.type"
              :id="field.name"
              :name="field.name"
              v-model="formData[field.name]"
              :placeholder="field.placeholder"
              :min="field.min"
              :max="field.max"
              :step="field.step"
              :required="field.required"
              class="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
          />

          <!-- 텍스트 영역 -->
          <textarea
              v-else-if="field.type === 'textarea'"
              :id="field.name"
              :name="field.name"
              v-model="formData[field.name]"
              :placeholder="field.placeholder"
              :rows="field.rows || 3"
              :required="field.required"
              class="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
          ></textarea>

          <!-- 선택 상자 -->
          <select
              v-else-if="field.type === 'select'"
              :id="field.name"
              :name="field.name"
              v-model="formData[field.name]"
              :required="field.required"
              class="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="" disabled selected>{{ field.placeholder }}</option>
            <option
                v-for="option in field.options"
                :key="option.value"
                :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>

          <!-- 날짜 선택 -->
          <input
              v-else-if="field.type === 'date'"
              type="date"
              :id="field.name"
              :name="field.name"
              v-model="formData[field.name]"
              :required="field.required"
              class="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />

          <!-- 체크박스 -->
          <div v-else-if="field.type === 'checkbox'" class="flex items-center">
            <input
                type="checkbox"
                :id="field.name"
                :name="field.name"
                v-model="formData[field.name]"
                :required="field.required"
                class="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <label :for="field.name" class="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
              {{ field.checkboxLabel }}
            </label>
          </div>

          <!-- 라디오 버튼 그룹 -->
          <div v-else-if="field.type === 'radio'" class="space-y-2">
            <div
                v-for="option in field.options"
                :key="option.value"
                class="flex items-center"
            >
              <input
                  type="radio"
                  :id="`${field.name}-${option.value}`"
                  :name="field.name"
                  :value="option.value"
                  v-model="formData[field.name]"
                  :required="field.required"
                  class="h-4 w-4 border-zinc-300 text-amber-600 focus:ring-amber-500 dark:border-zinc-700"
              />
              <label
                  :for="`${field.name}-${option.value}`"
                  class="ml-2 block text-sm text-zinc-700 dark:text-zinc-300"
              >
                {{ option.label }}
              </label>
            </div>
          </div>

          <!-- 파일 업로드 -->
          <div v-else-if="field.type === 'file'" class="space-y-2">
            <div class="flex items-center justify-center w-full">
              <label
                  :for="field.name"
                  class="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-300 border-dashed rounded-lg cursor-pointer bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              >
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload class="w-8 h-8 mb-3 text-zinc-500 dark:text-zinc-400" />
                  <p class="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <span class="font-semibold">클릭하여 업로드</span> 또는 파일을 여기로 드래그하세요
                  </p>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">
                    {{ field.fileTypes }}
                  </p>
                </div>
                <input
                    type="file"
                    :id="field.name"
                    :name="field.name"
                    :accept="field.accept"
                    :required="field.required"
                    class="hidden"
                    @change="handleFileChange($event, field.name)"
                />
              </label>
            </div>
            <div v-if="filePreview[field.name]" class="mt-2">
              <div class="flex items-center space-x-2">
                <File class="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                <span class="text-sm text-zinc-700 dark:text-zinc-300">{{ filePreview[field.name] }}</span>
                <button
                    type="button"
                    @click="removeFile(field.name)"
                    class="text-red-500 hover:text-red-700"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- 유효성 검사 오류 메시지 -->
          <p v-if="validationErrors[field.name]" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ validationErrors[field.name] }}
          </p>

          <!-- 도움말 텍스트 -->
          <p v-if="field.helpText" class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {{ field.helpText }}
          </p>
        </div>

        <!-- 제출 버튼 -->
        <div class="flex justify-end space-x-3">
          <button
              type="button"
              @click="resetForm"
              class="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            초기화
          </button>
          <button
              type="submit"
              :disabled="isSubmitting"
              class="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-800"
          >
            <div v-if="isSubmitting" class="flex items-center">
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
              제출 중...
            </div>
            <span v-else>제출</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, defineProps, defineEmits } from 'vue';
import { CheckCircle, AlertCircle, Upload, File, X, Loader2 } from 'lucide-vue-next';

const props = defineProps({
  // 폼 제목
  title: {
    type: String,
    default: '데이터 입력 폼'
  },
  // 폼 설명
  description: {
    type: String,
    default: '아래 양식을 작성하여 새 데이터를 추가하세요.'
  },
  // API 엔드포인트
  endpoint: {
    type: String,
    required: true
  },
  // 폼 필드 정의
  fields: {
    type: Array,
    required: true
  },
  // 초기 데이터 (수정 시 사용)
  initialData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['success', 'error', 'reset']);

// 폼 데이터 상태
const formData = reactive({ ...props.initialData });
const validationErrors = reactive({});
const isSubmitting = ref(false);
const filePreview = reactive({});
const files = reactive({});

// 알림 상태
const showAlert = ref(false);
const alertType = ref('success');
const alertTitle = ref('');
const alertMessage = ref('');

// 알림 스타일 계산
const alertClass = computed(() => {
  return alertType.value === 'success'
      ? 'bg-green-50 dark:bg-green-900/20'
      : 'bg-red-50 dark:bg-red-900/20';
});

const alertTextClass = computed(() => {
  return alertType.value === 'success'
      ? 'text-green-800 dark:text-green-400'
      : 'text-red-800 dark:text-red-400';
});

// 컴포넌트 마운트 시 초기 데이터 설정
onMounted(() => {
  // 초기 데이터가 있으면 폼 데이터에 설정
  if (Object.keys(props.initialData).length > 0) {
    Object.assign(formData, props.initialData);
  }
});

// 파일 변경 처리
const handleFileChange = (event, fieldName) => {
  const file = event.target.files[0];
  if (file) {
    files[fieldName] = file;
    filePreview[fieldName] = file.name;
  }
};

// 파일 제거
const removeFile = (fieldName) => {
  delete files[fieldName];
  delete filePreview[fieldName];
  // 파일 입력 필드 초기화
  const fileInput = document.getElementById(fieldName);
  if (fileInput) {
    fileInput.value = '';
  }
};

// 폼 유효성 검사
const validateForm = () => {
  // 유효성 검사 오류 초기화
  Object.keys(validationErrors).forEach(key => {
    delete validationErrors[key];
  });

  let isValid = true;

  // 각 필드 유효성 검사
  props.fields.forEach(field => {
    const value = formData[field.name];

    // 필수 필드 검사
    if (field.required && (value === undefined || value === null || value === '')) {
      validationErrors[field.name] = `${field.label}은(는) 필수 항목입니다.`;
      isValid = false;
    }

    // 이메일 형식 검사
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      validationErrors[field.name] = '유효한 이메일 주소를 입력하세요.';
      isValid = false;
    }

    // 최소/최대 길이 검사
    if (field.minLength && value && value.length < field.minLength) {
      validationErrors[field.name] = `${field.label}은(는) 최소 ${field.minLength}자 이상이어야 합니다.`;
      isValid = false;
    }

    if (field.maxLength && value && value.length > field.maxLength) {
      validationErrors[field.name] = `${field.label}은(는) 최대 ${field.maxLength}자까지 입력 가능합니다.`;
      isValid = false;
    }

    // 숫자 범위 검사
    if (field.type === 'number' && value !== undefined && value !== null && value !== '') {
      const numValue = Number(value);
      if (field.min !== undefined && numValue < field.min) {
        validationErrors[field.name] = `${field.label}은(는) ${field.min} 이상이어야 합니다.`;
        isValid = false;
      }
      if (field.max !== undefined && numValue > field.max) {
        validationErrors[field.name] = `${field.label}은(는) ${field.max} 이하여야 합니다.`;
        isValid = false;
      }
    }

    // 커스텀 유효성 검사 함수
    if (field.validator && typeof field.validator === 'function') {
      const error = field.validator(value);
      if (error) {
        validationErrors[field.name] = error;
        isValid = false;
      }
    }
  });

  return isValid;
};

// 폼 제출 처리
const submitForm = async () => {
  // 폼 유효성 검사
  if (!validateForm()) {
    showNotification('error', '입력 오류', '폼을 올바르게 작성해주세요.');
    return;
  }

  isSubmitting.value = true;
  showAlert.value = false;

  try {
    // FormData 객체 생성 (파일 업로드를 위해)
    const formDataToSend = new FormData();

    // 일반 폼 데이터 추가
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    // 파일 데이터 추가
    for (const key in files) {
      formDataToSend.append(key, files[key]);
    }

    // API 요청 보내기
    const response = await fetch(props.endpoint, {
      method: 'POST',
      body: formDataToSend,
      // FormData를 사용할 때는 Content-Type 헤더를 설정하지 않음 (자동으로 설정됨)
    });

    // 응답 처리
    if (response.ok) {
      const data = await response.json();
      showNotification('success', '성공', '데이터가 성공적으로 저장되었습니다.');
      emit('success', data);

      // 성공 후 폼 초기화 (선택적)
      // resetForm();
    } else {
      const errorData = await response.json();
      showNotification('error', '오류 발생', errorData.message || '데이터 저장 중 오류가 발생했습니다.');
      emit('error', errorData);
    }
  } catch (error) {
    console.error('Form submission error:', error);
    showNotification('error', '오류 발생', '서버 연결 중 오류가 발생했습니다.');
    emit('error', error);
  } finally {
    isSubmitting.value = false;
  }
};

// 알림 표시
const showNotification = (type, title, message) => {
  alertType.value = type;
  alertTitle.value = title;
  alertMessage.value = message;
  showAlert.value = true;

  // 5초 후 알림 자동 숨김
  setTimeout(() => {
    showAlert.value = false;
  }, 5000);
};

// 폼 초기화
const resetForm = () => {
  // 폼 데이터 초기화
  Object.keys(formData).forEach(key => {
    delete formData[key];
  });

  // 파일 데이터 초기화
  Object.keys(files).forEach(key => {
    delete files[key];
  });

  // 파일 미리보기 초기화
  Object.keys(filePreview).forEach(key => {
    delete filePreview[key];
  });

  // 유효성 검사 오류 초기화
  Object.keys(validationErrors).forEach(key => {
    delete validationErrors[key];
  });

  // 알림 숨김
  showAlert.value = false;

  // 이벤트 발생
  emit('reset');
};
</script>