import {
  CancellationToken,
  CustomTextEditorProvider,
  Range,
  TextDocument,
  WebviewPanel,
  window,
  workspace,
  WorkspaceEdit,
  Uri,
  Disposable,
  Webview,
} from "vscode";
import * as path from "path";
import { StringDecoder } from "string_decoder";
import { Buffer } from "buffer";
interface Message {
  type: "ready" | "change";
  content: string;
}
function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
function arr2str(arr: Uint8Array) {
  const decoder = new StringDecoder();
  return decoder.end(Buffer.from(arr));
}

interface DocStore {
  content: string;
  lock: boolean;
}
export class MarkdownEditorProvider implements CustomTextEditorProvider {
  // 注册函数
  static register(instance: MarkdownEditorProvider) {
    return window.registerCustomEditorProvider(`MarkSwift`, instance, {
      webviewOptions: {
        retainContextWhenHidden: true,
        enableFindWidget: true,
      },
    });
  }

  // 大致分为两个部分，编辑器实例部分，和视图层 resolve 部分

  // 编辑器实例
  template: string = ""; // 模板数据
  private disposables:Disposable[]=[];
  private storage = new Map<unknown, DocStore>();
  /**
   * @constructor
   * @param type
   */
  constructor(public readonly type: string) {
  }
  public register(){
    const disposable = MarkdownEditorProvider.register(this);
    this.disposables.push(disposable);
    return this;
  }

  public dispose(){
    for (const item of this.disposables) {
      item.dispose();
    }
  }


  // resolve 视图
  public async resolveCustomTextEditor(
    document: TextDocument,
    webviewPanel: WebviewPanel,
    token: CancellationToken
  ) {
    const uri = document.uri.toString();
    if (!this.storage.has(uri)) {
      this.storage.set(uri, {
        content: "",
        lock: false,
      });
    }

    webviewPanel.webview.options = {
      enableScripts: true,
    };

    if (!this.template) {
      const templatePath = path.resolve(
        __dirname,
        `../client/milkdown/index.html`
      );
      const templateUri = Uri.file(templatePath);
      const arr = await workspace.fs.readFile(templateUri);
      this.template = arr2str(arr);
    }

    this.listen(document, webviewPanel);

    webviewPanel.webview.html = this.createHTML(document, webviewPanel);
  }

  public createAsWebviewPanel(document: TextDocument) {
    const panel = window.createWebviewPanel(
      "MarkSwift",
      document.fileName,
      -1,
      { retainContextWhenHidden: true, enableFindWidget: true, enableScripts: true }
    );
    panel.webview.html = this.createHTML(document, panel);
    
    return panel;
  }
  /**
   * 创建 html 文件
   * @param document
   * @returns
   */
  private createHTML(document: TextDocument, webviewPanel: WebviewPanel) {
    const assetsPath = webviewPanel.webview.asWebviewUri(
      Uri.file(path.resolve(__dirname, `../client/milkdown`))
    );
    const nonce = getNonce();
    const result = this.template
      .replace("{{base}}", assetsPath + "/")
      .replace(new RegExp("{{cspSource}}", "g"), webviewPanel.webview.cspSource)
      .replace(new RegExp("{{nonce}}", "g"), nonce);
    return result;
  }

  /**
   *
   * @param document
   * @param webviewPanel
   */
  private listen(document: TextDocument, webviewPanel: WebviewPanel) {
    const uri = document.uri.toString();
    const store = this.storage.get(uri) as DocStore;

    // 监听 webview
    webviewPanel.webview.onDidReceiveMessage(({ type, content }: Message) => {
      const actions = {
        change: this.updateDocument.bind(this),
        ready: () => {
          store.lock = false;
          store.content = "";
          this.sendContent(document, webviewPanel.webview);
          this.sendConfig(document, webviewPanel.webview);
          return;
        },
      };
      actions[type](content, document);
    });

    // 监听 文档变更时间
    const changeDocumentSubscription = workspace.onDidChangeTextDocument(
      async (e) => {
        const uri = document.uri.toString();
        const store = this.storage.get(uri) as DocStore;

        // 当前视图造成的变更
        if (store.lock) {
          store.lock = false;
          return;
        }

        // 不是当前文档的变更
        if (e.document !== document) {
          return;
        }

        // Sometimes VS Code reports a document change without a change.
        // 没有发生实际变更的
        if (e.contentChanges.length === 0) {
          return;
        }

        // 发生变更时就发送数据
        this.sendContent(document, webviewPanel.webview);
      }
    );

    // 主题改变的监听
     const themeChangeSub = window.onDidChangeActiveColorTheme(() => {
      webviewPanel.webview.postMessage({
        type: "restart",
      });
    });
    // dispose 监听
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
      themeChangeSub.dispose();
    });

  }

  /**
   * 发送配置
   * @param document
   * @param webview
   */
  private sendConfig(document: TextDocument, webview: Webview) {
    const config = {
      theme: {
        1: "light",
        2: "dark",
        3: "highContrast", //HighContrast
      }[window.activeColorTheme.kind],
      uri: document.uri.toString(),
      eol: { 1: "LF", 2: "CRLF" }[document.eol],
      mode: "edit",
    };
    webview.postMessage({
      type: "config",
      content: config,
    });
  }

  /**
   * 发送内容
   * @param document
   * @param webview
   * @returns
   */
  private sendContent(document: TextDocument, webview: Webview) {
    const text = document.getText();
    const uri = document.uri.toString();
    const store = this.storage.get(uri) as DocStore;

    if (text === store.content) {
      return;
    }

    webview.postMessage({
      type: "change",
      text: text.replace(/\r\n/g, "\n"),
    });
  }

  // 更新文档
  private async updateDocument(content: string, document: TextDocument) {
    const uri = document.uri.toString();
    const store = this.storage.get(uri) as DocStore;
    store.lock = true;
    const text = document.getText();
    if (text === content) {
      return;
    }
    store.content =
      document.eol === 2 ? content.replace(/\n/g, "\r\n") : content;
    const workspaceEdit = new WorkspaceEdit();
    workspaceEdit.replace(
      document.uri,
      new Range(0, 0, document.lineCount, 0),
      store.content
    );
    workspace.applyEdit(workspaceEdit);
  }
}
