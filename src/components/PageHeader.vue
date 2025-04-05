<template>
  <div class="page-header">
    <el-icon class="back-icon" @click="handleBack"><ArrowLeft /></el-icon>
    <h1>{{ title }}</h1>
    <div class="action-buttons">
      <el-icon v-if="showAdd" class="action-icon" @click="handleAdd"><Plus /></el-icon>
      <el-icon v-if="showDelete" class="action-icon delete-icon" @click="handleDelete"><Delete /></el-icon>
      <div v-if="!showAdd && !showDelete" class="placeholder"></div>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft, Plus, Delete } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  title: {
    type: String,
    default: '标题'
  },
  showAdd: {
    type: Boolean,
    default: false
  },
  showDelete: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add', 'delete'])

const handleBack = () => router.back()
const handleAdd = () => emit('add')
const handleDelete = () => emit('delete')
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #2d6eb2 0%, #75b2f7 100%);
  padding: 16px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: fixed; 
  top: 0; left: 0; right: 0;       
  z-index: 100;   
}

.page-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.back-icon,
.action-icon {
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.back-icon:hover,
.action-icon:hover {
  transform: scale(1.1);
}

.placeholder {
  width: 20px;
}

</style>