
import * as vscode from 'vscode';
import {MarkdownEditorProvider} from "./Editor";
export function activate(context: vscode.ExtensionContext) {
	const editor = new MarkdownEditorProvider("milkdown").register();
	context.subscriptions.push(editor);
	return { editor };
}

export function deactivate() {}
