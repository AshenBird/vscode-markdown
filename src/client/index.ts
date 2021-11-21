import Vditor from 'vditor';
import "vditor/src/assets/scss/index.scss";

// @ts-ignore
// const vscode = acquireVsCodeApi();

// const changeContent = (content: string) => {
//   vscode.postMessage({
//     type: "change",
//     content
//   });
// };
// const el = document.getElementById("app") as HTMLElement;

const vditor = new Vditor("app", {});