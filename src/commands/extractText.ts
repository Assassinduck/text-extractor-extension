import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export async function extractText() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found.');
        return;
    }

    const selectedText = editor.document.getText(editor.selection);
    if (!selectedText) {
        vscode.window.showErrorMessage('No text selected.');
        return;
    }

    const currentFilePath = editor.document.uri.fsPath;
    const currentDir = path.dirname(currentFilePath);

    // Ask user if they want to choose a different folder
    const folderChoice = await vscode.window.showQuickPick([
        'Current folder',
        'Choose folder...'
    ], {
        placeHolder: 'Where do you want to save the new file?'
    });

    if (!folderChoice) {
        vscode.window.showErrorMessage('Operation cancelled.');
        return;
    }

    let targetDir = currentDir;

    if (folderChoice === 'Choose folder...') {
        const folderUri = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            defaultUri: vscode.Uri.file(currentDir),
            openLabel: 'Select Folder'
        });

        if (!folderUri || folderUri.length === 0) {
            vscode.window.showErrorMessage('No folder selected. Operation cancelled.');
            return;
        }

        targetDir = folderUri[0].fsPath;
    }

    const filename = await vscode.window.showInputBox({
        prompt: 'Enter the filename for the new file',
        placeHolder: 'newFile.txt'
    });

    if (!filename) {
        vscode.window.showErrorMessage('Filename not provided. Operation cancelled.');
        return;
    }

    const newFilePath = path.join(targetDir, filename);

    fs.writeFile(newFilePath, selectedText, (err) => {
        if (err) {
            vscode.window.showErrorMessage('Error writing to file: ' + err.message);
            return;
        }

        vscode.window.showInformationMessage('File created: ' + newFilePath);
        vscode.workspace.openTextDocument(newFilePath).then(doc => {
            vscode.window.showTextDocument(doc);
        });
    });
}