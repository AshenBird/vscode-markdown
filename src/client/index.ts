import Vditor from 'vditor';
import "vditor/src/assets/scss/index.scss";
import "./index.css";

// @ts-ignore
const vscode = acquireVsCodeApi();

const changeContent = (content: string) => {
  vscode.postMessage({
    type: "change",
    content
  });
};

let content = "";
let config:Record<string,unknown> ={};
const dataBus = document.getElementById("Data");

const configBus = document.getElementById("Config");

if(dataBus){
  content  = dataBus.innerText;
  document.body.removeChild(dataBus);
}
if(configBus){
  config  = JSON.parse(configBus.innerText);
  document.body.removeChild(configBus);
}


const vditor = new Vditor("app", {
  value:content,
  mode:"ir",
  theme:config?.theme==="dark"?"dark":"classic",
  input:changeContent,
  counter:{enable:true},
  preview:{ maxWidth: 1000000, delay:100 },
  outline:{
    enable:true,
    position:"left"
  },
  toolbar:[
    "emoji",
    "headings",
    "bold",
    "italic",
    "strike",
    "link",
    "|",
    "list",
    "ordered-list",
    "check",
    "outdent",
    "indent",
    "|",
    "quote",
    "line",
    "code",
    "inline-code",
    "insert-before",
    "insert-after",
    "|",
    "record",
    "table",
    "|",
    "undo",
    "redo",
    "|",
    "edit-mode",
    "|",
    "export",
    {
        name: "more",
        toolbar: [
            "both",
            "outline",
            "preview",
            // "devtools",
            "info",
            "help",
        ],
    },
  ],
  cache:{
    enable:false
  }
});

