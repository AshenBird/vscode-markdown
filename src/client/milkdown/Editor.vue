<script lang="tsx">
import { Slice } from "prosemirror-model";
import { defineComponent, onMounted, ref, Ref, inject, watchEffect } from "vue";
import {
  Editor,
  rootCtx,
  editorViewCtx,
  parserCtx,
  defaultValueCtx,
} from "@milkdown/core";
import { vscode as vscodeTheme } from "./theme-vscode/index";
import { gfm } from "@milkdown/preset-gfm";
import { tooltip } from "@milkdown/plugin-tooltip";
import { slash } from "@milkdown/plugin-slash";
import { history } from "@milkdown/plugin-history";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { clipboard } from "@milkdown/plugin-clipboard";
// 协同编辑
// import { collaborative, y } from '@milkdown/plugin-collaborative';
import { emoji } from "@milkdown/plugin-emoji";
import { prism } from "@milkdown/plugin-prism";
import { math } from "@milkdown/plugin-math";
import { VueEditor, useEditor, EditorRef } from "@milkdown/vue";
import { debounce, getTitles } from "./utils";
import "katex/dist/katex.min";

// @ts-ignore
const vscode = acquireVsCodeApi();

export default defineComponent({
  emits: {
    change: null,
  },
  props: {
    config: {
      type: Object,
      default: {},
    },
  },
  setup: (props, context) => {
    const outline = inject("outline") as Ref<unknown[]>;
    const state = vscode.getState();
    const content = ref("");
    if (state?.text) {
      content.value = state.text;
    }
    const isOption = ref(false);
    const editorRef = ref() as Ref<EditorRef>;
    const getEditor = ref();
    const updateOutline = async () => {
      outline.value = getTitles().tree;
      // console.log(document.querySelectorAll(".heading"))
    };
    watchEffect(() => {
      if (editorRef.value) {
        updateOutline();
      }
    });
    const createEditor = () => {
      getEditor.value = useEditor((root) =>
        Editor.make()
          .config((ctx) => {
            ctx.set(rootCtx, root);
            ctx.set(defaultValueCtx, content.value);
            ctx.set(listenerCtx, {
              markdown: [
                debounce(
                  (getMarkdown: () => string) => onChange(getMarkdown),
                  200
                ),
              ],
            });
          })
          .use(vscodeTheme())
          .use(gfm)
          .use(math)
          .use(slash)
          .use(tooltip)
          .use(history)
          .use(listener)
          .use(emoji)
          .use(clipboard)
          .use(prism)
      );
      isOption.value = true;
    };

    const serverLock = ref(false);
    // 编辑器内容变更事件响应
    const onChange = (getContent: () => string) => {
      if (serverLock.value) {
        serverLock.value = false;
        return;
      }
      const text = getContent();
      if (content.value === text) return;
      updateOutline();
      content.value = text;
      vscode.setState({ text });
      vscode.postMessage({
        type: "change",
        content: getContent(),
      });
    };

    onMounted(() => {
      console.log("editor mounted");
      vscode.postMessage({
        type: "ready",
      });
    });

    const updateEditor = (markdown: string) => {
      if (typeof markdown !== "string") return;
      const editor = editorRef.value.get() as Editor;
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        const parser = ctx.get(parserCtx);
        const doc = parser(markdown);
        if (!doc) {
          return;
        }
        content.value = markdown;
        const state = view.state;
        view.dispatch(
          state.tr.replace(
            0,
            state.doc.content.size,
            new Slice(doc.content, 0, 0)
          )
        );
      });
    };

    const restartEditor = () => {
      const editor = editorRef.value.get() as Editor;
      editor.action(async (ctx) => {
        const view = ctx.get(editorViewCtx);
        view.dom.parentElement?.remove();
        await createEditor();
        isOption.value = true;
        vscode.postMessage({
          type: "ready",
        });
      });
    };
    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message.type) {
        case "change": {
          const text = message.text;
          if (text === content.value) return;
          serverLock.value = true;

          updateEditor(text);
          vscode.setState({ text });

          return;
        }
        case "restart": {
          restartEditor();
          return;
        }
      }
    });
    createEditor();
    return () =>
      isOption.value ? (
        <VueEditor editor={getEditor.value} editorRef={editorRef} />
      ) : (
        <></>
      );
  },
});
</script>
