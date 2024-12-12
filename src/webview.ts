import { Uri, ExtensionContext } from "vscode";
import * as fs from "fs";

export function getWebviewContent(context: ExtensionContext) {
  const htmlPath = Uri.joinPath(context.extensionUri, "webview.html");
  const content = fs.readFileSync(htmlPath.fsPath, "utf8");
  return content.toString();
}
