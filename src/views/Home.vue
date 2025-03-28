
<template>
  <div id="app">
    <!-- 顶部标题栏 -->
    <div class="header">
      <div class="welcome">欢迎使用！</div>
      <div class="system-title">智能场景监控系统</div>
    </div>

    <div class="function-icons">
      <div class="icon">
          <img src="../assets/hxjl.png" />
          <p>日常查床</p>
      </div>
      <div class="icon">
        <img src="../assets/hxjl.png" />
        <p>在院人员</p>
      </div>
      <div class="icon">
        <img src="../assets/hxjl.png" />
        <p>签到签退</p>
      </div>
      <div class="icon">
        <img src="../assets/hxjl.png" />
        <p>异常申诉</p>
      </div>
      <div class="icon">
        <router-link to="matter">
          <img src="../assets/hxjl.png" />
        </router-link>   
          <p>页面实例</p>
      </div>
      <div class="icon">
        <router-link to="/category">
           <img src="../assets/hxjl.png" />
        </router-link>
        <p>基础控件</p>
      </div>
      <div class="icon">
        <router-link to="/org">
           <img src="../assets/hxjl.png" />
        </router-link>
        <p>机构管理</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
<style scoped>

body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #2d6eb2 0%, #75b2f7 100%);
  padding: 30px 20px 30px 20px;
  color: white;
}

.welcome {
  text-align: left;
  font-size: 32px; 
  margin-bottom: 6px; 
  font-family: 'YouYuan', 'STZhongsong', sans-serif;
  font-weight: bold;
}

.system-title {
  padding-top: 10px;
  text-align: center;
  font-size: 36px; 
  font-weight: bold;
  font-family: 'YouYuan', 'STZhongsong', sans-serif;
  background: linear-gradient(to right, #fff, #e6f3ff);
  -webkit-background-clip: text;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

/* 功能图标区域样式 */
.function-icons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 10px;
}

/* 单个功能图标样式 */
.icon {
  cursor: pointer;
  text-align: center;
}

/* 功能图标图片样式 */
.icon img {
  width: 80px;
  height: 80px;
}

/* 功能图标文字样式 */
.icon p {
  margin-top: -10px;
  font-size: 14px;
}
</style>
