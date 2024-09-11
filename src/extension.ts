// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { AutoCompletionEvent } from "./test/types";
import { send } from "./sender";

let statusBarItem: vscode.StatusBarItem;
let ev: vscode.Disposable | null = null;
let suggestionsCount = 0;
let charCount = 0;
let previousText = "";
let currentFolderStartTime: Date | null = null;
let currentFolderName: string | null = null;

let autocompletionEvents: AutoCompletionEvent[] = [];

const config = vscode.workspace.getConfiguration('faros');
const batchInterval = Number(config.get<string>('batchInterval')) || 60000; // 1 minute

// Function to check and log events every minute
function checkAndLogEvents() {
  if (autocompletionEvents.length > 0) {
    console.log("Sending autocompletion events:", autocompletionEvents);
	send(autocompletionEvents);
    // Clear the events after logging
    autocompletionEvents = [];
  }
}

// Set interval to check and log events every minute (60000 milliseconds)
setInterval(checkAndLogEvents, batchInterval);

function isTabPress(change: vscode.TextDocumentContentChangeEvent): boolean {
  return change.text.length > 1 && change.rangeLength !== 0;
}

function getCurrentFolderName(): string | null {
  if (
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
  ) {
    return vscode.workspace.workspaceFolders[0].name;
  }
  return null;
}

function updateFolderTime() {
  const currentFolderEndTime = new Date();
  if (currentFolderStartTime && currentFolderName) {
    const duration =
      currentFolderEndTime.getTime() - currentFolderStartTime.getTime();
    if (duration > 0) {
      // update server
    }
  }
  currentFolderStartTime = currentFolderEndTime;
  currentFolderName = getCurrentFolderName();
}

vscode.workspace.onDidChangeWorkspaceFolders(updateFolderTime);

function registerSuggestionListener() {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    statusBarItem.text = "Auto-compilations: 0";
    statusBarItem.tooltip = "Auto-compilations Count";
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
              "Auto-compilations: " +
              suggestionsCount +
              " (" +
              charCount +
              " characters)";

            // Store the event in memory
            autocompletionEvents.push({
              timestamp: new Date(),
              charCountChange: currentLengthChange,
              fileName: activeEditor.document.fileName,
            });

            //update server
            updateFolderTime();
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

  if (
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
  ) {
    const currentFolder = vscode.workspace.workspaceFolders[0];
    const folderName = currentFolder.name;

    currentFolderStartTime = new Date();
    currentFolderName = folderName;
  }

  registerSuggestionListener();

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  //   let disposable = vscode.commands.registerCommand(
  //     "vscode-copilot-stats.helloWorld",
  //     () => {
  //       // The code you place here will be executed every time your command is executed
  //       // Display a message box to the user
  //       vscode.window.showInformationMessage(
  //         "Hello World from vscode-copilot-stats!"
  //       );
  //     }
  //   );

  //   context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log("Faros VSCode extension is now inactive!");

  updateFolderTime();
}
