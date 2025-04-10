<template>
  <div class="flex min-h-screen flex-col space-y-6">
    <div class="container grid flex-1 gap-12 py-8">
      <main class="flex w-full flex-1 flex-col overflow-hidden">
        <div class="flex flex-col gap-4 md:gap-6">
          <div class="grid gap-1">
            <h1 class="text-2xl font-bold tracking-tight">제품 관리</h1>
            <p class="text-zinc-500 dark:text-zinc-400">새 제품을 추가하거나 기존 제품을 관리합니다.</p>
          </div>

          <!-- 데이터 입력 폼 컴포넌트 -->
          <DataEntryForm
              title="새 제품 추가"
              description="아래 양식을 작성하여 새 제품을 추가하세요."
              endpoint="/api/products"
              :fields="productFields"
              @success="handleSuccess"
              @error="handleError"
              @reset="handleReset"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import DataEntryForm from '../../components/DataEntryForm.vue';

// 제품 폼 필드 정의
const productFields = [
  {
    name: 'name',
    label: '제품명',
    type: 'text',
    placeholder: '제품명을 입력하세요',
    required: true,
    minLength: 2,
    maxLength: 100
  },
  {
    name: 'description',
    label: '제품 설명',
    type: 'textarea',
    placeholder: '제품에 대한 상세 설명을 입력하세요',
    rows: 4,
    required: true,
    minLength: 10
  },
  {
    name: 'category',
    label: '카테고리',
    type: 'select',
    placeholder: '카테고리를 선택하세요',
    required: true,
    options: [
      { value: 'electronics', label: '전자제품' },
      { value: 'clothing', label: '의류' },
      { value: 'books', label: '도서' },
      { value: 'home', label: '가정용품' },
      { value: 'beauty', label: '뷰티' }
    ]
  },
  {
    name: 'price',
    label: '가격 (원)',
    type: 'number',
    placeholder: '가격을 입력하세요',
    required: true,
    min: 0,
    step: 100
  },
  {
    name: 'stock',
    label: '재고 수량',
    type: 'number',
    placeholder: '재고 수량을 입력하세요',
    required: true,
    min: 0,
    step: 1
  },
  {
    name: 'releaseDate',
    label: '출시일',
    type: 'date',
    required: true
  },
  {
    name: 'featured',
    label: '특별 상품',
    type: 'checkbox',
    checkboxLabel: '이 제품을 특별 상품으로 표시',
    required: false
  },
  {
    name: 'status',
    label: '상태',
    type: 'radio',
    required: true,
    options: [
      { value: 'active', label: '판매 중' },
      { value: 'inactive', label: '판매 중지' },
      { value: 'coming_soon', label: '출시 예정' }
    ]
  },
  {
    name: 'image',
    label: '제품 이미지',
    type: 'file',
    accept: 'image/*',
    fileTypes: 'PNG, JPG, GIF 파일 (최대 5MB)',
    required: false,
    helpText: '제품의 대표 이미지를 업로드하세요. 권장 크기: 800x600px'
  }
];

// 이벤트 핸들러
const handleSuccess = (data) => {
  console.log('제품이 성공적으로 추가되었습니다:', data);
  // 성공 후 추가 작업 (예: 목록 페이지로 리디렉션)
};

const handleError = (error) => {
  console.error('제품 추가 중 오류 발생:', error);
  // 오류 처리 로직
};

const handleReset = () => {
  console.log('폼이 초기화되었습니다.');
  // 폼 초기화 후 추가 작업
};
</script>