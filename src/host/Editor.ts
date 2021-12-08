import {
  CancellationToken,
  CustomTextEditorProvider,
  Range,
  TextDocument,
  WebviewPanel,
  window,
  workspace,
  WorkspaceEdit,
  Uri
} from "vscode";
import * as vscode from "vscode";
import * as path from "path";
import { StringDecoder } from "string_decoder";
import { Buffer } from 'buffer';
interface Message {
  type: "ready" | "change";
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
function arr2str(arr: Uint8Array) {
  const decoder = new StringDecoder();
  return decoder.end(Buffer.from(arr));
}
export class MarkdownEditorProvider implements CustomTextEditorProvider {
  template: string = "";
  webview!: vscode.Webview;
  content: string = "";
  private eol: "CRLF"|"LF" = "LF";
  private clientLock = false;

  constructor(public readonly type: string, private disposables: any[]) {
    this.register();
  }

  public async resolveCustomTextEditor(
    document: TextDocument,
    webviewPanel: WebviewPanel,
    token: CancellationToken
  ) {
    this.webview = webviewPanel.webview;
    this.webview.options = {
      enableScripts: true,
    };
    const text = document.getText();
    if(text.match(/\r\n/)){
      this.eol = "CRLF";
    };

    if (!this.template) {
      const templatePath = path.resolve(__dirname, `../client/${this.type}/index.html`);
      const templateUri = Uri.file(templatePath);
      const arr = await workspace.fs.readFile(templateUri);
      this.template = arr2str(arr);
    }
    this.mountListener(document, webviewPanel);
    this.webview.html = this.createHTML(document);
  }

  private async updateDocument(content: string, document: TextDocument) {
    this.clientLock = true;
    const text = document.getText();
    if (text === content) { return; }
    this.content = this.eol==="CRLF"?content.replace(/\n/g,'\r\n'):content;
    const workspaceEdit = new WorkspaceEdit();
    workspaceEdit.replace(
      document.uri,
      new Range(0, 0, document.lineCount, 0),
      this.content
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
      .replace(new RegExp("{{cspSource}}", "g"), this.webview.cspSource)
      .replace(new RegExp("{{nonce}}", "g"), nonce)
      .replace("{{init-config}}", JSON.stringify({
        theme: ({
          1: "light",
          2: "dark",
          3: "highContrast"//HighContrast
        }[window.activeColorTheme.kind]),
        uri:document.uri.toString(),
        EOL:this.eol
      }));
    return result;
  }

  private mountListener(document: TextDocument, webviewPanel: vscode.WebviewPanel) {
    this.webview.onDidReceiveMessage(({ type, content }: Message) => {
      const actions = {
        change: this.updateDocument,
        ready: () => {
          console.log('---editor is ready---');
          this.clientLock = false;
          this.content = '';
          this.updateWebview(document, webviewPanel);
          return;
        }
      };
      actions[type](content, document);
    });

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(async (e) => {
      if (this.clientLock) {
        this.clientLock = false;
        return;
      }
      if (e.document !== document) {
        return;
      }
      // Sometimes VS Code reports a document change without a change.
      if (e.contentChanges.length === 0) {
        return;
      }
      this.updateWebview(document, webviewPanel);
    });

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });
    vscode.window.onDidChangeActiveColorTheme(() => {
      webviewPanel.webview.postMessage({
        type: 'restart',
      });
    });
  }
  updateWebview(document: TextDocument, webviewPanel: vscode.WebviewPanel) {
    const text = document.getText();
    if (text === this.content) { return; }

    webviewPanel.webview.postMessage({
      type: 'change',
      text: text.replace(/\r\n/g,"\n"),
    });
  }
  register() {
    // const type = this.type;
    this.disposables.push(
      vscode.window.registerCustomEditorProvider(
        `MarkSwift`,
        this,
        { webviewOptions: { retainContextWhenHidden: true } }
      ));
  };
}
