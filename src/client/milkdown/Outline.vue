<script lang="tsx">
import { inject, defineComponent, ref, watchEffect, Ref } from "vue";
import { NTree, NInput, NSpace, TreeOption, NAffix } from "naive-ui";
import { OutlineTreeOption } from "./App.vue";
import { Key } from "naive-ui/lib/tree/src/interface";
export default defineComponent(() => {
  // const sideWidth = inject("sideWidth", ref(250));
  const pattern = inject("pattern", ref(""));
  const selectedKeys = inject<Ref<Key[]>>("selectedKeys", ref([]));
  const expandedKeys = inject<Ref<Key[]>>("expandedKeys", ref([]));
  const flatOutline = inject<Ref<OutlineTreeOption[]>>("flatOutline", ref([]));
  const outline = inject<Ref<OutlineTreeOption[]>>("outline", ref([]));
  const scrollLock = inject("scrollLock", ref(false));
  const lastScrollTime = inject("lastScrollTime", ref(0));
  // const readonly = inject("readonly", ref(false));
  watchEffect(() => {
    expandedKeys.value = flatOutline.value.map((item) => item.key as Key);
  });
  const outlineExpendChange = ((
    keys: Key[],
    list: (OutlineTreeOption | null)[]
  ) => {
    expandedKeys.value = keys;
  }) as (value: Key[], option: Array<TreeOption | null>) => void;
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

  // 匹配搜索条件
  const onPatternChange = (text: string) => {
    pattern.value = text;
    const flatNodes = [];
    flatNodes.push(...document.querySelectorAll(`.n-tree-node-wrapper`));
    flatNodes.forEach((node) => {
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
  };
  // const affixListenTo = ()=>{}
  const OutlineView = () => (
    // <NSpace vertical size={12}>
    <div class="outline-container">
      <NTree
        default-expand-all={true}
        expanded-keys={expandedKeys}
        selected-keys={selectedKeys}
        selectable
        data={outline.value}
        block-node
        onUpdate:selectedKeys={outlineSelected}
        onUpdateExpandedKeys={outlineExpendChange}
      />
      <div class="outline-search">
        <NInput
          value={pattern.value}
          onInput={onPatternChange}
          placeholder="搜索"
        />
      </div>
    </div>
    // </NSpace>
  );
  return OutlineView;
});
</script>
<style>
.outline-search {
  background-color: var(--color);
  position: absolute;
  left: 0;
  right: 15px;
  top: 0;
  padding: 15px;
  padding-right: 0;
  padding-top: 10px;
  z-index: 1;
}
</style>
