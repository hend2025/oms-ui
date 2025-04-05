import { onMounted, onUnmounted, nextTick } from 'vue'

interface ScrollOptions {
  loading: boolean
  hasMore: boolean
  fetchData: () => Promise<void>
}

export const useInfiniteScroll = (options: ScrollOptions) => {
  // 滚动加载
  const handleScroll = () => {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement
    if (!options.loading && options.hasMore && (scrollHeight - scrollTop - clientHeight) <= 50) {
      options.fetchData()
    }
  }

  // 定位到目标元素
  const scrollToTarget = async (targetId: string | number) => {
    nextTick(() => {
      const targetElement = document.querySelector(`[data-id="${targetId}"]`)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'instant', block: 'center' })
      }
    })
  }

  // 生命周期钩子
  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    scrollToTarget
  }
}