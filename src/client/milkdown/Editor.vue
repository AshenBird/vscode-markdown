<script lang="ts" setup>
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
import { emoji } from "@milkdown/plugin-emoji";
import { prism } from "@milkdown/plugin-prism";
import { math } from "@milkdown/plugin-math";
import { VueEditor, useEditor } from "@milkdown/vue";
import 'katex/dist/katex.min';
const props = defineProps({
  value: {
    type: String,
    default: "",
  },
  config: {
    type: Object,
    default: {},
  },
});

const emit = defineEmits<{
  (e: "change", value: string): void;
}>();

const editor = useEditor((root) =>
  Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root);
      ctx.set(defaultValueCtx, props.value);
      ctx.set(listenerCtx, {
        markdown: [
          (getMarkdown: () => string) => {
            emit("change", getMarkdown());
          },
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

</script>

<template>
  <vue-editor :editor="editor" />
</template>
