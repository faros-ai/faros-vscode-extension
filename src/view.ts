
import * as vscode from "vscode";
import { calculateAutoCompletionStats, getTopRepositories } from "./stats";

export class FarosViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'farosView';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();
		const stats = calculateAutoCompletionStats();
		const topRepositories = getTopRepositories(5);
		const topRepositoriesHtml = topRepositories.map(repo => `<div>${repo.repository}: ${repo.count}</div>`).join('');
		
		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<title>Faros AI</title>
			</head>
			<body>
                <div>Auto-completion events</div>
				<div>Today: ${stats.today.count}</div>
				<div>This week: ${stats.thisWeek.count}</div>
				<div>This month: ${stats.thisMonth.count}</div>
				<br />
				<div>Time saved</div>
				<div>Today: ${stats.today.timeSaved}</div>
				<div>This week: ${stats.thisWeek.timeSaved}</div>
				<div>This month: ${stats.thisMonth.timeSaved}</div>
				<br />
				<div>Top repositories</div>
				${topRepositoriesHtml}
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}