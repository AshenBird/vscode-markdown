import {
  CancellationToken,
  CustomTextEditorProvider,
  Range,
  TextDocument,
  WebviewPanel,
  window,
  workspace,
  WorkspaceEdit,
} from "vscode";
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
interface Message {
  type: "save" | "change";
  content: string;
}
function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export class MarkdownEditorProvider implements CustomTextEditorProvider {
  template: string;
  constructor(public readonly type:string, private disposables:any[]) {
    this.template = fs.readFileSync(
      path.resolve(__dirname, `../client/${this.type}/index.html`),
      {
        encoding: "utf8",
      }
    );
    this.register();
  }
  webview!: vscode.Webview;

  public async resolveCustomTextEditor(
    document: TextDocument,
    webviewPanel: WebviewPanel,
    token: CancellationToken
  ) {
    this.webview = webviewPanel.webview;
    this.webview.options = {
      enableScripts: true,
    };
    this.webview.html = this.createHTML(document);
    this.mountListener(document);
  }

  private async clientChange(content: string, document: TextDocument) {
    const workspaceEdit = new WorkspaceEdit();
    workspaceEdit.replace(
      document.uri,
      new Range(0, 0, document.lineCount, 0),
      content
    );
    workspace.applyEdit(workspaceEdit);
  }

  private createHTML(document: TextDocument) {
    const assetsPath = this.webview
      .asWebviewUri(vscode.Uri.file(path.resolve(__dirname, `../client/${this.type}`)));
      const nonce = getNonce();
    const result = this.template
      // .replace(new RegExp("/mcswift://", "g"), assetsPath + "/")
      .replace("{{base}}", assetsPath + "/")
      .replace("{{init-data}}", document.getText().replace(new RegExp("\n", "g"), "<br>"))
      // .replace(new RegExp("{{cspSource}}","g"), this.webview.cspSource)
      // .replace(new RegExp("{{nonce}}","g"), nonce)
      .replace("{{init-config}}", JSON.stringify({
        theme: ({
          1:"light",
          2:"dark",
          3:"light"//HighContrast
        }[window.activeColorTheme.kind])
      }));
    return result;
  }

  private mountListener(document: TextDocument) {
    this.webview.onDidReceiveMessage(({ type, content }: Message) => {
      const actions = {
        save(content: string) { },
        change: this.clientChange,
      };
      actions[type](content, document);
    });

    vscode.workspace.onDidChangeTextDocument(async (e) => {
      if (e.document !== document) {
        return;
      }
      // Sometimes VS Code reports a document change without a change.
      if (e.contentChanges.length === 0) {
        return;
      }
      const newContent = e.document.getText();
      this.webview.postMessage({ type: "change", content: newContent });
    });
  }
  register(){
    const type = this.type;
    this.disposables.push(
     vscode.window.registerCustomEditorProvider(
      `mcswift.${type}`,
      this,
      { webviewOptions: { retainContextWhenHidden: true } }
    ));
  };
}
