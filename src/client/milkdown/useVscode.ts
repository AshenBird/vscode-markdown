import { provide, Ref, ref, watch } from "vue";
import { EditorRef } from "@milkdown/vue";
import { Slice } from "prosemirror-model";
import {
  Editor,
  editorViewCtx,
  parserCtx,
} from "@milkdown/core";
export const useVscode = () => {
  const create = ref(()=>{}) as Ref<()=>void>;
  const editorRef = ref() as Ref<EditorRef>;
  const content = ref("");
  const ready = ref(false);
  const config = ref({
    theme: "dark",
    uri: "",
    eol: "LF",
    mode: "edit"
  });
  provide("create", create);
  provide("editorRef", editorRef);
  provide("content", content);
  provide("ready", ready);
  provide("config", config);
  // @ts-ignore
  if (acquireVsCodeApi) {

    const restartEditor = () => {
      const editor = editorRef.value.get() as Editor;
      editor.action(async (ctx) => {
        const view = ctx.get(editorViewCtx);
        view.dom.parentElement?.remove();

        ready.value = false;
        await create.value();
      });
    };

    const updateEditor = (markdown: string) => {
      if (typeof markdown !== "string") { return; }
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

    // @ts-ignore
    const vscode = acquireVsCodeApi();
    const state = vscode.getState();
    const serverLock = ref(false);
    if (state?.text) {
      content.value = state.text;
    }
    watch(content, (n,o) => {
      if (serverLock.value) {
        serverLock.value = false;
        return;
      }
      vscode.setState({ n });
      vscode.postMessage({
        type: "change",
        content: n,
      });
    });
    watch(ready, (n,o) => {
      if (!n) { return; }
      vscode.postMessage({
        type: "ready",
      });
    });

    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message.type) {
        case "change": {
          const text = message.text;
          if (text === content.value) { return; }
          serverLock.value = true;
          updateEditor(text);
          return;
        }
        case "restart": {
          restartEditor();
          return;
        }
        case "config": {
          console.log("config",message.content);
          config.value = message.content;
          return;
        }
      }
    });
  }
  return {
    create,
    editorRef,
    content,
    ready,
    config,
  };
};