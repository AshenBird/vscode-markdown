<script setup lang="ts">
import MilkdownEditor from "./Editor.vue"
const vscode = acquireVsCodeApi();

const onChange = (content: string) => {
  vscode.postMessage({
    type: "change",
    content,
  });
};

let content = "";
let config: Record<string, unknown> = {};
const dataBus = document.getElementById("Data");
const configBus = document.getElementById("Config");
if (dataBus) {
  content = dataBus.innerText;
  document.body.removeChild(dataBus);
}
if (configBus) {
  config = JSON.parse(configBus.innerText);
  document.body.removeChild(configBus);
}
const debounce = <T extends unknown[]>(func: (...args: T) => void, delay: number) => {
  let timer: number;
  return (...args: T) => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
          func.apply(undefined, args);
      }, delay);
  };
};


</script>
<template>
  <milkdown-editor @change="onChange" :value="content" :config="config"/>
</template>