<script setup lang="ts">
import { ref, provide, computed, watchEffect } from "vue";
import {
  NConfigProvider,
  NLayout,
  NLayoutHeader,
  NLayoutSider,
  NTree,
  NInput,
  NSpace,
  darkTheme,
  TreeOption,
} from "naive-ui";
import MilkdownEditor from "./Editor.vue";
import { Key } from "naive-ui/lib/tree/src/interface";

// 初始化配置项
let config: Record<string, unknown> = {};
const configBus = document.getElementById("Config");
if (configBus) {
  config = JSON.parse(configBus.innerText);
  document.body.removeChild(configBus);
}

// 主题配置
const theme = config.theme === "dark" ? darkTheme : null;

/** 大纲功能 **/
// 大纲树类型
export interface OutlineTreeOption extends TreeOption {
  scroll: () => void;
}
// 用来检索大纲的数据
const pattern = ref("");
// 大纲树数据
const outline = ref<OutlineTreeOption[]>([]);
// 扁平的大纲数据
const flatOutline = ref<OutlineTreeOption[]>([]);
// 实际显式的大纲，后期加入大纲过滤功能
const outlineShow = computed(() => {
  return outline.value;
});

const selectedKeys = ref<(string | number)[]>([]);
// 展开的大纲层级
const expandedKeys = ref<(string | number)[]>([]);

const scrollLock = ref(false);

watchEffect(() => {
  expandedKeys.value = flatOutline.value.map(
    (item) => item.key as string | number
  );
});
const outlineExpendChange = ((
  keys: (string | number)[],
  list: (OutlineTreeOption | null)[]
) => {
  expandedKeys.value = keys;
}) as (value: Key[], option: Array<TreeOption | null>) => void;

// 注入
provide("flatOutline", flatOutline);
provide("outline", outline);

// 滚动相关
const lastScrollTime = ref(0);
const onScroll = () => {
  lastScrollTime.value = Date.now();
  if (scrollLock.value) return;
  const rs = [];
  for (const item of flatOutline.value) {
    // @ts-ignore
    const { top } = item.getRect()[0];
    if (top > 0) rs.push([top, item]);
  }
  rs.sort((a, b) => a[0] - b[0]);
  selectedKeys.value = [rs[0][1].key];
  const suffix = document.getElementById(rs[0][1].key);
  suffix?.scrollIntoView({
    block:"center",
    behavior: "smooth",
  });
};


// 大纲元素被点击时的响应
const outlineSelected = ((
  keys: (string | number)[],
  list: (OutlineTreeOption | null)[]
) => {
  selectedKeys.value = keys;
  if (list.length > 0) {
    scrollLock.value = true;
    list[0]?.scroll();
    const timer = setInterval(()=>{
      if(Date.now()-lastScrollTime.value<=200)return;
      scrollLock.value = false;
      clearInterval(timer)
    },200)
  }
}) as (value: Key[], option: Array<TreeOption | null>) => void;

</script>
<template>
  <n-config-provider :theme="theme">
    <n-layout style="height: 100vh; background-color: var(--surface)">
      <!-- <n-layout-header
        style="height: 50px; padding: 24px"
        bordered
      ></n-layout-header> -->
      <n-layout
        position="absolute"
        style="top: 0px; background-color: var(--surface)"
        has-sider
      >
        <n-layout-sider
          :native-scrollbar="false"
          collapse-mode="transform"
          :collapsed-width="0"
          :width="350"
          show-trigger="bar"
          content-style="padding: 24px;"
          bordered
        >
          <n-space vertical :size="12">
            <n-input v-model:value="pattern" placeholder="搜索" />
            <n-tree
              :default-expand-all="true"
              :expanded-keys="expandedKeys"
              :selected-keys="selectedKeys"
              selectable
              :data="outlineShow"
              block-line
              @update:selected-keys="outlineSelected"
              @update-expanded-keys="outlineExpendChange"
            />
          </n-space>
        </n-layout-sider>
        <n-layout
          content-style="padding: 20px; padding-left:60px;"
          style="background-color: var(--surface)"
          :native-scrollbar="false"
          @scroll="onScroll"
        >
          <milkdown-editor @ready="onScroll" :config="config" />
        </n-layout>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>
