<script setup lang="ts">
import { ref, provide, watchEffect } from "vue";
import {
  NConfigProvider,
  NLayout,
  NLayoutHeader,
  NLayoutSider,
  NTree,
  NInput,
  NSpace,
  darkTheme,
} from "naive-ui";
import MilkdownEditor from "./Editor.vue";

// 初始化配置项
let config: Record<string, unknown> = {};
const configBus = document.getElementById("Config");
const outline = ref<unknown>([]);
provide("outline", outline);
watchEffect(()=>{
  console.log(outline.value)
})
if (configBus) {
  config = JSON.parse(configBus.innerText);
  document.body.removeChild(configBus);
}

const theme = config.theme === "dark" ? darkTheme : null;
const pattern = ref("");
const handleUpdateValue = (
  k: string,
  item: { key: string; scroll: () => void }
) => {
  // console.log(k), 
  item.scroll();
};
</script>
<template>
  <n-config-provider :theme="theme">
    <n-layout style="height: 100vh; background-color: var(--surface)">
      <n-layout-header
        style="height: 50px; padding: 24px"
        bordered
      ></n-layout-header>
      <n-layout
        position="absolute"
        style="top: 50px; background-color: var(--surface)"
        has-sider
      >
        <n-layout-sider
          :native-scrollbar="false"
          collapse-mode="transform"
          :collapsed-width="100"
          :width="200"
          show-trigger="bar"
          content-style="padding: 24px;"
          bordered
        >
          <n-space vertical :size="12">
            <n-input v-model:value="pattern" placeholder="搜索" />
            <n-tree
              :pattern="pattern"
              selectable
              :data="outline"
              block-line
              @update:selected-keys="handleUpdateValue"
            />
          </n-space>
        </n-layout-sider>
        <n-layout
          content-style="padding: 20px;"
          style="background-color: var(--surface)"
          :native-scrollbar="false"
        >
          <milkdown-editor :config="config" />
        </n-layout>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>
