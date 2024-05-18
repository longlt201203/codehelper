/**
 * This code is a Visual Studio Code extension that helps with documenting code.
 * It uses Google's Gemini API to generate documentation for selected code.
 * 
 * @summary Code documentation helper using Google Gemini
 * @author longlt201203
 * @since 2023-12-01
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { AiService } from './ai-service';

// This constant holds the prompts for the Gemini AI
const aiPrompts = {
	// Prompt for documenting code
	document: 'You are an AI assistant specializing in documenting code. Your task is to improve the readability and maintainability of the provided code by generating clear, concise, and comprehensive documentation. Note that your result will be used to overwrite the code of the user, so make sure that the output must be in the right format for the programming language. Response schema: { text: "result" }'
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Get the configuration for the extension
	const config = vscode.workspace.getConfiguration('codehelper');
	console.log('Congratulations, your extension "codehelper" is now active!');

	/**
	 * Sets up the extension by asking the user for their Google API key.
	 * This key is used to access Google's Gemini API.
	 */
	async function setUp() {
		// Prompt the user for their Google API key
		const input = await vscode.window.showInputBox({
			prompt: 'Enter your Google API key',
			ignoreFocusOut: true,
			password: true
		});

		// If the user provided an API key, save it to the extension's global configuration
		if (input) {
			await config.update('googleApiKey', input, vscode.ConfigurationTarget.Global);
			vscode.window.showInformationMessage(`OK!`);
		}
	}

	/**
	 * This function is called when the user runs the "codehelper.document" command.
	 * It sends the selected code to Google's Gemini API for documentation.
	 * The documentation is then inserted into the editor.
	 */
	async function helpDocument() {
		// Get the active editor
		const editor = vscode.window.activeTextEditor;

		// If an editor is open, proceed
		if (editor) {
			// Get the user's Google API key from the extension's configuration
			const apiKey = config.get<string>('googleApiKey');

			// If the API key is set, proceed
			if (apiKey) {
				// Get the Gemini service
				const geminiFlash = AiService.getGeminiFlash(apiKey);

				// Get the currently active document and the selected text
				const document = editor.document;
				const selection = editor.selection;

				// Initialize an empty string for the text to be processed
				let text = '';

				// If no text is selected, use the entire document's content
				if (selection.isEmpty) {
					text = document.getText();
				} else {
					// Otherwise, use the selected text
					text = document.getText(selection);
				}

				// Inform the user that the extension is contacting Gemini
				vscode.window.showInformationMessage('Contacting Gemini...');
				// Send the text to Gemini for documentation
				const result = await geminiFlash.generateContent({
					systemInstruction: aiPrompts.document,
					contents: [{ role: 'user', parts: [{ text: `Filename: ${document.fileName}` }, { text: text }] }],
					generationConfig: {
						responseMimeType: 'application/json'
					}
				});
				// Extract the generated documentation from the response
				const data = JSON.parse(result.response.text());
				text = data.text;

				// Create a workspace edit to apply changes to the document
				const edit = new vscode.WorkspaceEdit();
				if (selection.isEmpty) {
					// If no text was selected, replace the entire document content
					const fullRange = new vscode.Range(
						document.positionAt(0),
						document.positionAt(document.getText().length)
					);
					edit.replace(document.uri, fullRange, text);
				} else {
					// Otherwise, replace the selected text with the generated documentation
					edit.replace(document.uri, selection, text);
				}

				// Apply the edit to the document
				await vscode.workspace.applyEdit(edit);
				// Inform the user that the documentation process is complete
				await vscode.window.showInformationMessage('Done!');

			} else {
				// If the API key is not set, inform the user to set it up first
				vscode.window.showInformationMessage('You have to set up the extension first.');
				return;
			}
		} else {
			// If no editor is open, inform the user
			vscode.window.showInformationMessage('No active editor found.');
		}
	}

	// Register the commands for setting up the extension and documenting code
	let disposableSetUp = vscode.commands.registerCommand('codehelper.setUp', setUp);
	let disposableDocument = vscode.commands.registerCommand('codehelper.document', helpDocument);

	// Add the commands to the extension's subscriptions so they can be disposed of later
	context.subscriptions.push(disposableSetUp);
	context.subscriptions.push(disposableDocument);
}

// This method is called when your extension is deactivated
export function deactivate() { }
