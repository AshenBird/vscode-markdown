import * as vscode from 'vscode';
import {MarkdownEditorProvider} from "./Editor";
export const createMindMapExtensions = (context: vscode.ExtensionContext)=>{

	let disposables:{ dispose(): any }[]=[];
  new MarkdownEditorProvider("milkdown",disposables);
  return disposables;
};

