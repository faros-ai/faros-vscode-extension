// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { AutoCompletionEvent } from "./types";
import { send } from "./sender";
import { farosConfig, updateConfig } from "./config";
import { addAutoCompletionEvent, clearAutoCompletionEvents, getAutoCompletionEvents, setContext } from "./state";

let statusBarItem: vscode.StatusBarItem;
let ev: vscode.Disposable | null = null;
let suggestionsCount = 0;
let charCount = 0;
let previousText = "";

// Function to check and log events every minute
function checkAndLogEvents() {
  if (getAutoCompletionEvents().length > 0) {
    console.log("Sending autocompletion events:", getAutoCompletionEvents());
    send(getAutoCompletionEvents());
    // Clear the events after logging
    clearAutoCompletionEvents();
  }
}

// Set interval to check and log events every minute (60000 milliseconds)
setInterval(checkAndLogEvents, farosConfig.batchInterval());

function isTabPress(change: vscode.TextDocumentContentChangeEvent): boolean {
  // return change.text.length > 1 && change.rangeLength !== 0; 
  // this condition will be true for any document change event that introduces more than
  // one character into the document. This will capture all auto-completions, but unfortunately
  // will also capture copy/paste events.
  return change.text.length > 1;
}

function registerSuggestionListener() {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    statusBarItem.text = "Autocompletions: 0";
    statusBarItem.tooltip = "Autocompletions Count";
    statusBarItem.show();
  }

  if (ev === null) {
    ev = vscode.workspace.onDidChangeTextDocument((event) => {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor || event.document !== activeEditor.document) {
        return;
      }
      const change = event.contentChanges[0];
      const updatedText = activeEditor.document.getText();
      if (updatedText.length > previousText.length) {
        if (isTabPress(change)) {
          const currentLengthChange = change.text.replace(/\s/g, "").length;

          if (currentLengthChange > 0) {
            suggestionsCount++;
            charCount += currentLengthChange;
            statusBarItem.text =
              "Autocompletions: " +
              suggestionsCount +
              " (" +
              charCount +
              " chars)";

            // Store the event in memory
            addAutoCompletionEvent({
              timestamp: new Date(),
              charCountChange: currentLengthChange,
              fileName: activeEditor.document.fileName,
            });
          }
        }
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
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log("Faros VSCode extension is now inactive!");
}
