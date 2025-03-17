
<template>
  <div id="app">
    <!-- 系统标题栏 -->
    <div class="system-title-bar">
      <!-- 订单管理 logo 图标 -->
      <img src="../assets/index.jpg" alt="订单管理" />
    </div>
    <div class="function-icons">
      <div class="icon">
        <router-link to="/purchase">
          <img src="../assets/hxjl.png" />
        </router-link>  
          <p>物料采购</p>
      </div>
      <div class="icon">
        <img src="../assets/hxjl.png" />
        <p>订单管理</p>
      </div>
      <div class="icon">
        <img src="../assets/hxjl.png" />
        <p>收支记账</p>
      </div>
      <div class="icon">
        <img src="../assets/hxjl.png" />
        <p>财务对账</p>
      </div>
      <div class="icon">
        <router-link to="/matterCategory">
          <img src="../assets/hxjl.png" />
        </router-link>   
        <p>物料分类</p>
      </div>
      <div class="icon">
        <img src="../assets/hxjl.png" />
        <p>产品分类</p>
      </div>
      <div class="icon">
        <img src="../assets/hxjl.png" />
        <p>客户管理</p>
      </div>
      <div class="icon">
        <img src="../assets/hxjl.png" />
        <p>账号设置</p>
      </div>
    </div>
  </div>
</template>

<script setup>
 
</script>

<style scoped>
/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

/* 系统标题栏样式 */
.system-title-bar {
  height: 200px;
  background-color: lightblue;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 100%;
    height: 100%;
  }

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