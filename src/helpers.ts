
import * as vscode from 'vscode';

export const openFileDialog = async (dir: string, canSelectFiles: boolean, canSelectFolders: boolean, openLabel: string, canSelectMany: boolean): Promise<string | undefined> => {

    let targetDir = ""
    const folderUri = await vscode.window.showOpenDialog({
        canSelectFiles: canSelectFiles,
        canSelectFolders: canSelectFolders,
        canSelectMany: canSelectMany,
        defaultUri: vscode.Uri.file(dir),
        openLabel: openLabel
    });

    if (!folderUri || folderUri.length === 0) {
        vscode.window.showErrorMessage('No folder or file selected. Operation cancelled.');
        return undefined
    }

    targetDir = folderUri[0].fsPath;
    return targetDir
}