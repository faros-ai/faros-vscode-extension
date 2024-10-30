// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { send } from "./sender";
import { farosConfig, updateConfig } from "./config";
import { addAutoCompletionEvent, clearAutoCompletionEventQueue, getAutoCompletionEventQueue, setContext } from "./state";
import { getGitBranch, getGitRepoName } from "./git";
import * as path from "path";
import FarosPanel from "./panel";

let statusBarItem: vscode.StatusBarItem;
let ev: vscode.Disposable | null = null;
let suggestionsCount = 0;
let charCount = 0;
let previousText = "";
let farosPanel: FarosPanel | null = null;

// Function to check and log events every minute
function checkAndLogEvents() {
  if (getAutoCompletionEventQueue().length > 0) {
    console.log("Sending autocompletion events:", getAutoCompletionEventQueue());
    send(getAutoCompletionEventQueue());
    // Clear the events after logging
    clearAutoCompletionEventQueue();
  }
}

// Set interval to check and log events every minute (60000 milliseconds)
setInterval(checkAndLogEvents, farosConfig.batchInterval());

export enum TextChangeType {
  Undo,
  Redo,
  NoChange,
  Deletion,
  HandwrittenChar,
  Space,
  AutoCloseBracket,
  AutoCompletion,
  Unknown
}

export function classifyTextChange(event: vscode.TextDocumentChangeEvent, updatedText: string, previousText: string): TextChangeType {
  if (event.reason === vscode.TextDocumentChangeReason.Undo) {
    return TextChangeType.Undo;
  } else if (event.reason === vscode.TextDocumentChangeReason.Redo) {
    return TextChangeType.Redo;
  } else if (event.contentChanges.length === 0) {
    return TextChangeType.NoChange;
  } else if (event.contentChanges.length === 1 && event.contentChanges[0].rangeLength > 0 && event.contentChanges[0].text.length === 0) {
    return TextChangeType.Deletion;
  } else if (event.contentChanges.length === 1 && event.contentChanges[0].text.length === 1) {
    return TextChangeType.HandwrittenChar;
  } else if (event.contentChanges.length > 0 && event.contentChanges.every(change => change.text.length > 0 && change.text.trim().length === 0)) {
    return TextChangeType.Space;
  } else if (event.contentChanges.length === 1 && event.contentChanges[0].text.length === 2 && ['()', '[]', '{}', '""', "''", '``'].includes(event.contentChanges[0].text)) {
    return TextChangeType.AutoCloseBracket;
  } else if (event.contentChanges.length > 0 && event.contentChanges.some(change => change.text.replace(/\s/g, "").length > 0) && updatedText.length > previousText.length) {
    return TextChangeType.AutoCompletion;
  } else {
    return TextChangeType.Unknown;
  }
}

function registerSuggestionListener() {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    statusBarItem.text = "Auto-completions: 0";
    statusBarItem.tooltip = "Auto-completions Count";
    statusBarItem.show();
  }

  if (ev === null) {
    ev = vscode.workspace.onDidChangeTextDocument((event) => {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor || event.document !== activeEditor.document) {
        return;
      }
      const updatedText = activeEditor.document.getText();
      const changeType = classifyTextChange(event, updatedText, previousText);

      if (changeType === TextChangeType.AutoCompletion) {
        const currentLengthChange = event.contentChanges[0].text.replace(/\s/g, "").length;

        suggestionsCount++;
        charCount += currentLengthChange;
        statusBarItem.text =
          "Auto-completions: " +
          suggestionsCount +
          " (" +
          charCount +
          " chars)";

        // Store the event in memory
        addAutoCompletionEvent({
          timestamp: new Date(),
          charCountChange: currentLengthChange,
          filename: activeEditor.document.fileName,
          extension: path.extname(activeEditor.document.fileName),
          language: activeEditor.document.languageId,
          repository: getGitRepoName(activeEditor.document.fileName),
          branch: getGitBranch(activeEditor.document.fileName),
        });

        farosPanel?.refresh();
      }

      previousText = updatedText;
    });
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("Faros VSCode extension is now active!");
  setContext(context);
  updateConfig();
  registerSuggestionListener();

  farosPanel = new FarosPanel(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      FarosPanel.viewType,
      farosPanel
    )
  );

  // Set context as a global as some tests depend on it
  (global as any).testExtensionContext = context;
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log("Faros VSCode extension is now inactive!");
}


