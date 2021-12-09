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
  NPopselect,
  NIcon,
  NButton,
  darkTheme,
  TreeOption,
} from "naive-ui";
import { InformationCircleOutline as InfoIcon } from "@vicons/ionicons5";
import MilkdownEditor from "./Editor.vue";
import { Key } from "naive-ui/lib/tree/src/interface";

import { useVscode } from "./useVscode";

const { config } = useVscode();

const readonly = ref(config.value.mode === "read");

provide("readonly", readonly);
// 主题配置
const theme = computed(() =>
  config.value.theme === "dark" ? darkTheme : null
);
/** 大纲功能 **/
// 大纲树类型
export interface OutlineTreeOption extends TreeOption {
  scroll: () => void;
}
// 用来检索大纲的数据
const pattern = ref("");
provide("pattern", pattern);
const onPatternChange = (text: string) => {
  pattern.value = text;
  const flatNodes = [];
  flatNodes.push(...document.querySelectorAll(`.n-tree-node-wrapper`));
  flatNodes.forEach((node, index) => {
    if (
      (
        node.querySelector(".n-tree-node-content__text") as HTMLElement
      ).innerHTML.includes(text)
    ) {
      (node as HTMLElement).style.display = "";
      return;
    }
    if (text) {
      (node as HTMLElement).style.display = "none";
    }
  });
  // pattern.value
};
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
  if (rs.length === 0) return;
  rs.sort((a, b) => a[0] - b[0]);

  selectedKeys.value = [rs[0][1].key];
  const suffix = document.getElementById(rs[0][1].key);
  suffix?.scrollIntoView({
    block: "center",
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
    const timer = setInterval(() => {
      if (Date.now() - lastScrollTime.value <= 200) return;
      scrollLock.value = false;
      clearInterval(timer);
    }, 200);
  }
}) as (value: Key[], option: Array<TreeOption | null>) => void;

const editorLeftPadding = ref(60);
const editorStyle = computed(
  () => `
    padding: 20px;
    padding-left: ${editorLeftPadding.value}px;
    padding-bottom: 0;
  `
);

// resize
const getSidebarWidth = () => {
  const limit = 250;
  const w = window.innerWidth;
  const rw = w * 0.2;
  if (w < 600) {
    editorLeftPadding.value = 0;
    return 0;
  }
  editorLeftPadding.value = 60;
  return rw < limit ? limit : rw;
};
const sideWidth = ref(getSidebarWidth());
window.onresize = () => {
  sideWidth.value = getSidebarWidth();
};

const infos = computed(()=>[
  {
    label: config.value.uri,
    value: "uri",
  },
  {
    label: `eol: ${config.value.eol}`,
    value: "eol",
  },
]);
</script>
<template>
  <n-config-provider :theme="theme">
    <n-layout class="top-container">
      <n-layout-header
        style="
          height: 30px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        "
        bordered
      >
        <n-popselect :options="infos" size="medium">
          <n-button
            #icon
            strong
            quaternary
            circle
            size="tiny"
            style="margin-right: 8px"
          >
            <n-icon>
              <info-icon />
            </n-icon>
          </n-button>
        </n-popselect>
      </n-layout-header>
      <n-layout
        position="absolute"
        style="top: 30px; background-color: var(--surface)"
        :has-sider="!readonly"
      >
        <n-layout-sider
          v-if="!readonly"
          :native-scrollbar="false"
          collapse-mode="transform"
          :collapsed-width="0"
          :width="sideWidth"
          show-trigger="bar"
          content-style="padding: 24px;"
          bordered
        >
          <n-space vertical :size="12">
            <n-input
              :value="pattern"
              @input="onPatternChange"
              placeholder="搜索"
            />
            <n-tree
              :default-expand-all="true"
              :expanded-keys="expandedKeys"
              :selected-keys="selectedKeys"
              selectable
              :data="outlineShow"
              block-node
              @update:selected-keys="outlineSelected"
              @update-expanded-keys="outlineExpendChange"
            />
          </n-space>
        </n-layout-sider>
        <n-layout
          :content-style="editorStyle"
          style="background-color: var(--surface)"
          :native-scrollbar="true"
          @scroll="onScroll"
        >
          <milkdown-editor @ready="onScroll" :config="config" />
        </n-layout>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>
