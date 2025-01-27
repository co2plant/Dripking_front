import ref from 'vue';

export async function useFetch(url){
    const data = ref(null);
    const error = ref(null);
    const loading = ref(false);
    const hasMore = ref(true);
    const canFetchMore = ref(true);
    const isLoading = ref(false);
    const items = ref([]);
    const currentPage = ref(0);
    const showNextPageIndicator = ref(false);

    if (!hasMore.value || isLoading.value || !canFetchMore.value) return

    isLoading.value = true
    canFetchMore.value = false

    try {
        let response = await fetch(url)
        if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.')

        const data = await response.json()

        items.value = [...items.value, ...data.content]
        hasMore.value = !data.last
        currentPage.value++

        // Reset indicators after successful fetch
        showNextPageIndicator.value = false

        // Small delay before allowing next fetch
        setTimeout(() => {
            if (hasMore.value) {
                showNextPageIndicator.value = true
            }
        }, 500)

    } catch (err) {
        console.error('Error fetching items:', err)
        error.value = '데이터를 불러오는데 실패했습니다.'
    } finally {
        isLoading.value = false
    }

    return {
        data,
        error,
        loading,
        hasMore,
        canFetchMore,
    };
}