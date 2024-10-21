import React from 'react';
import * as vscode from "vscode";
import { calculateAutoCompletionStats, getTopRepositories } from "./stats";
import { renderToString } from 'react-dom/server';
import { ChakraProvider, Text } from '@chakra-ui/react';

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

		webviewView.webview.html = renderToString(this.render());
	}

	private render() {
		const stats = calculateAutoCompletionStats();
		const topRepositories = getTopRepositories(5);
		return (
			<ChakraProvider>
				<Text color="white" fontSize='xl'>Auto-completion events</Text>
				<Text color="white">Today: {stats.today.count} ({stats.today.timeSaved.toFixed(2)} min saved)</Text>
				<Text color="white">This week: {stats.thisWeek.count} ({stats.thisWeek.timeSaved.toFixed(2)} min saved)</Text>
				<Text color="white">This month: {stats.thisMonth.count} ({stats.thisMonth.timeSaved.toFixed(2)} min saved)</Text>
				<br />
				<Text color="white" fontSize='lg'>Top repositories</Text>
				{
					topRepositories.length > 0 ? (
						topRepositories.map(repo => 
							<Text color="white" key={repo.repository}>{repo.repository}: {repo.count}</Text>
						)
					) : (
						<Text color="white">N/A</Text>
					)
				}
			</ChakraProvider>
		);
	}
}


