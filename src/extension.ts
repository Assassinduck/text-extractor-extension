import * as vscode from 'vscode';
import { extractText } from './commands/extractText';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('textExtractor.extractText', extractText);
    context.subscriptions.push(disposable);

    // Add keybinding and context menu contributions in package.json
}

export function deactivate() {}