import {
  Editor,
  rootCtx,
  editorViewCtx,
  parserCtx,
  defaultValueCtx,
} from "@milkdown/core";
import { vscode as vscodeTheme } from './theme-vscode/index';
import { gfm } from "@milkdown/preset-gfm";
import { tooltip } from "@milkdown/plugin-tooltip";
import { slash } from "@milkdown/plugin-slash";
import { history } from "@milkdown/plugin-history";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { clipboard } from "@milkdown/plugin-clipboard";
import { emoji } from "@milkdown/plugin-emoji";
import { prism } from "@milkdown/plugin-prism";
import { math } from "@milkdown/plugin-math";
import "../common/base.css";
import "./index.css";

// @ts-ignore
const vscode = acquireVsCodeApi();

const changeContent = (content: string) => {
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

Editor.make()
  .config((ctx) => {
    ctx.set(rootCtx, document.querySelector("#app"));
    ctx.set(defaultValueCtx, content);
    ctx.set(listenerCtx, {
      markdown: [
        (getMarkdown: () => string) => {
          changeContent(getMarkdown());
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
  .create();
