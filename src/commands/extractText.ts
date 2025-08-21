import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { openFileDialog } from '../helpers';

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
    type AppendOrNewFile = typeof append | typeof newFile

    const append = 'Append to existing an file' as const
    const newFile = 'Extract to a new file' as const

    const appendOrNewFile = await vscode.window.showQuickPick([
        append,
        newFile
    ], {
        placeHolder: 'Which extraction mode do you want to use?'
    })


    if (appendOrNewFile === append) {
        await extractAndAppendToFile(currentDir, selectedText)
    } else {
        await extractToNewFile(currentDir, selectedText)
    }

}

const extractAndAppendToFile = async (currentDir: string, selectedText: string) => {
    const selectedFile = await openFileDialog(currentDir, true, false, "Select file to append to", false)

    if (selectedFile === undefined) {
        return
    }

    const addNewLinesToText = "\n\r" + selectedText

    fs.appendFile(selectedFile, addNewLinesToText, (err) => {
        if (err) {
            vscode.window.showErrorMessage('Error writing to file: ' + err.message);
            return;
        }
        vscode.window.showInformationMessage('Text appended to: ' + selectedFile);
        vscode.workspace.openTextDocument(selectedFile).then(doc => {
            vscode.window.showTextDocument(doc);
        });
    })



}




const extractToNewFile = async (currentDir: string, selectedText: string) => {
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

    let targetDir: string | undefined = currentDir;

    if (folderChoice === 'Choose folder...') {
        targetDir = await openFileDialog(currentDir, false, true, "Select folder", false)
        if (!targetDir) return
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