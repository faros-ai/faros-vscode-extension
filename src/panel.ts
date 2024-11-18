import * as vscode from "vscode";
import { calculateAutoCompletionStats, calculateRatios, getRecentHourlyChartData, getTopLanguages, getTopRepositories } from "./stats";
import { ThemeType } from "./webview/components/types";

const RECENT_HOURLY_CHART_DATA_HOURS = 24;
const TOP_LANGUAGES_LIMIT = 5;
const TOP_REPOSITORIES_LIMIT = 5;

export default class FarosPanel implements vscode.WebviewViewProvider {
  public static readonly viewType = "farosPanel";

  private disposables: vscode.Disposable[] = [];
  private webview: vscode.Webview | null = null;

  constructor(private readonly extensionUri: vscode.Uri) {}

  public refresh() {
    const stats = calculateAutoCompletionStats();
    const ratios = calculateRatios();
    const topRepositories = getTopRepositories(TOP_REPOSITORIES_LIMIT);
    const topLanguages = getTopLanguages(TOP_LANGUAGES_LIMIT);
    const recentHourlyAggregates = getRecentHourlyChartData(RECENT_HOURLY_CHART_DATA_HOURS);

	this.webview?.postMessage({
		command: "refresh",
		stats,
		ratios,
		topRepositories,
    topLanguages,
    recentHourlyAggregates,
	  });
  }

  public updateTheme() {
    this.webview?.postMessage({
      command: "themeChanged",
      theme: vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark || vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.HighContrast ? "Dark" : "Light" as ThemeType,
    });
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    webviewView.webview.onDidReceiveMessage(
      async (msg: any) => {
        switch (msg.command) {
          case "startup":
            this.refresh();
            this.updateTheme();
            break;
        }
      },
      null,
      this.disposables
    );

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.onDidDispose(() => this.dispose(), null, this.disposables);

	this.webview = webviewView.webview;
  }

  public dispose() {
    // this._panel.dispose();
    while (this.disposables.length) {
      const x = this.disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "out", "main.wv.js")
    );

    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "media", "styles.css")
    );

    const getNonce = (): string => {
      let text: string = "";
      const possible: string =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };
    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Panel Title Goes Here</title>
        <link rel="stylesheet" href="${styleUri}">
      </head>
      <body>
        <div id="root"></div>
        <script>
          const vscode = acquireVsCodeApi();
          window.onload = function() {
            vscode.postMessage({ command: 'startup' });
            console.log('HTML started up.');
          };
        </script>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}
