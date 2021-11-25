import * as vscode from 'vscode';
import {MarkdownEditorProvider} from "./Editor";
export const createMindMapExtensions = (context: vscode.ExtensionContext)=>{

	let disposables:{ dispose(): any }[]=[];

  

  // const register=(provider:MarkdownEditorProvider)=>{
  //   const type = provider.type;
  //   disposables.push(
  //    vscode.window.registerCustomEditorProvider(
  //     `mcswift.${type}`,
  //     provider,
  //     { webviewOptions: { retainContextWhenHidden: true } }
  //   ));
  // };
  const vditor = new MarkdownEditorProvider("vditor",disposables);
  const milkdown = new MarkdownEditorProvider("milkdown",disposables);
  // register(vditor);
  return disposables;
};

