// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { AiService } from './ai-service';

const aiPrompts = {
	document: 'You are an AI assistant specializing in documenting code. Your task is to improve the readability and maintainability of the provided code by generating clear, concise, and comprehensive documentation. (Output the result only. Don\'t use markdown format for output)'
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration('codehelper');
	console.log('Congratulations, your extension "codehelper" is now active!');

	async function setUp() {
		const input = await vscode.window.showInputBox({
			prompt: 'Enter your Google API key',
			ignoreFocusOut: true,
			password: true
		});

		if (input) {
			await config.update('googleApiKey', input, vscode.ConfigurationTarget.Global);
			vscode.window.showInformationMessage(`OK!`);
		}
	}

	async function helpDocument() {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const apiKey = config.get<string>('googleApiKey');

			if (apiKey) {
				const geminiFlash = AiService.getGeminiFlash(apiKey);

				const document = editor.document;
				const selection = editor.selection;

				let text = '';

				if (selection.isEmpty) {
					text = document.getText();
				} else {
					text = document.getText(selection);
				}

				await vscode.window.showInformationMessage('Contacting Gemini...');
				const result = await geminiFlash.generateContent({
					systemInstruction: aiPrompts.document,
					contents: [{ role: 'user', parts: [{ text: text }] }],
				});
				text = result.response.text();

				const edit = new vscode.WorkspaceEdit();
				if (selection.isEmpty) {
					// Replace the whole file content
					const fullRange = new vscode.Range(
						document.positionAt(0),
						document.positionAt(document.getText().length)
					);
					edit.replace(document.uri, fullRange, text);
				} else {
					// Replace the selected text
					edit.replace(document.uri, selection, text);
				}

				// Apply the edit
				await vscode.workspace.applyEdit(edit);
				await vscode.window.showInformationMessage('Done!');

			} else {
				vscode.window.showInformationMessage('You have to set up the extension first.');
				return;
			}
		} else {
			vscode.window.showInformationMessage('No active editor found.');
		}
	}

	let disposableSetUp = vscode.commands.registerCommand('codehelper.setUp', setUp);
	let disposableDocument = vscode.commands.registerCommand('codehelper.document', helpDocument);

	context.subscriptions.push(disposableSetUp);
	context.subscriptions.push(disposableDocument);
}

// This method is called when your extension is deactivated
export function deactivate() { }
