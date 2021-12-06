<script setup lang="ts">
import { ref, provide } from "vue";
import {NConfigProvider, NLayout, NLayoutHeader, NLayoutSider, NMenu, darkTheme } from "naive-ui"
import MilkdownEditor from "./Editor.vue";
import { NIcon, useMessage } from 'naive-ui'
import {
  BookOutline as BookIcon,
  PersonOutline as PersonIcon,
  WineOutline as WineIcon,
} from '@vicons/ionicons5'
// // @ts-ignore
// const vscode = acquireVsCodeApi();

// 初始化配置项
let config: Record<string, unknown> = {};
const configBus = document.getElementById("Config");
const outline = ref<unknown>([]) 
provide("outline",outline)
if (configBus) {
  config = JSON.parse(configBus.innerText);
  document.body.removeChild(configBus);
}

const theme = config.theme==="dark"?darkTheme:null
const handleUpdateValue =()=>{}
const menuOptions = [
  {
    label: '1973年的弹珠玩具',
    key: 'pinball-1973',
    children: [
      {
        label: '鼠',
        key: 'rat'
      }
    ]
  },
  {
    label: '寻羊冒险记',
    key: 'a-wild-sheep-chase',
  },
  {
    label: '舞，舞，舞',
    key: 'dance-dance-dance',
    children: [
      {
        type: 'group',
        label: '人物',
        key: 'people',
        children: [
          {
            label: '叙事者',
            key: 'narrator',
          },
          {
            label: '羊男',
            key: 'sheep-man',
          }
        ]
      },
      {
        label: '饮品',
        key: 'beverage',
        children: [
          {
            label: '威士忌',
            key: 'whisky'
          }
        ]
      },
      {
        label: '食物',
        key: 'food',
        children: [
          {
            label: '三明治',
            key: 'sandwich'
          }
        ]
      },
      {
        label: '过去增多，未来减少',
        key: 'the-past-increases-the-future-recedes'
      }
    ]
  }
]
</script>
<template>
<n-config-provider :theme="theme">
  <n-layout style="height: 100vh; background-color: var(--surface);">
    <n-layout-header style="height: 50px; padding: 24px;" bordered></n-layout-header>
    <n-layout position="absolute" style="top: 50px; background-color: var(--surface);" has-sider>
      <n-layout-sider
        :native-scrollbar="false"
        collapse-mode="transform"
        :collapsed-width="100"
        :width="200"
        show-trigger="bar"
        content-style="padding: 24px;"
        bordered
      >
        <n-menu @update:value="handleUpdateValue" :options="menuOptions" />
      </n-layout-sider>
      <n-layout content-style="padding: 20px;" style="background-color: var(--surface);" :native-scrollbar="false">
        <milkdown-editor :config="config" />
      </n-layout>
    </n-layout>
  </n-layout>
</n-config-provider>
</template>
