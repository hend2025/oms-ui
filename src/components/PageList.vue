<template>
  <div>

    <div class="list-area">
      <div v-for="item in list" 
        :key="item[keyField]"
        :data-id="item[keyField]"
        class="list-item-wrapper"
      >
      <slot name="item" :item="item"></slot>
      </div>
    </div>

    <div v-if="loading" class="loading-text">
      <el-icon class="loading"><Loading /></el-icon>
      加载中...
    </div>
    <div v-if="!loading && !hasMore && list.length > 0" class="no-more-text">
      没有更多数据了
    </div>
    <div v-if="!loading && list.length === 0" class="empty-text">
      暂无数据
    </div>

  </div>
</template>

<script setup>
import { Loading } from '@element-plus/icons-vue'

defineProps({
  list: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: true
  },
  keyField: {
    type: String,
    default: 'id'
  }
})
</script>

<style scoped>
.list-area {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
}

.loading-text,
.no-more-text,
.empty-text {
  padding: 16px 0;
  color: #909399;
  font-size: 14px;
  text-align: center;
}

.empty-text {
  padding: 40px 0;
}

.loading-text .loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>