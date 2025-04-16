// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { send, squash } from "./sender";
import { farosConfig, updateConfig } from "./config";
import { addAutoCompletionEvent, addHandWrittenEvent, clearAutoCompletionEventQueue, clearHandWrittenEventQueue, getAutoCompletionEventQueue, getHandWrittenEventQueue, setContext } from "./state";
import { getGitBranch, getGitRepoName } from "./git";
import * as path from "path";
import FarosPanel from "./panel";

let statusBarItem: vscode.StatusBarItem;
let changeTextDocumentListener: vscode.Disposable | null = null;
let themeChangedListener: vscode.Disposable | null = null;
let suggestionsCount = 0;
let charCount = 0;
let previousText = "";
let farosPanel: FarosPanel | null = null;

// Function to check and log events every minute
function checkAndLogEvents() {
  const autoCompletionEvents = getAutoCompletionEventQueue();
  if (autoCompletionEvents.length > 0) {
    console.log("Sending autocompletion events:", autoCompletionEvents);
    try {
      send(autoCompletionEvents, farosConfig.autoCompletionCategory());
    } catch (error) {
      console.error("Error sending autocompletion events:", error);
    }
    // Clear the events after logging
    clearAutoCompletionEventQueue();
  }

  const handWrittenEvents = getHandWrittenEventQueue();
  if (handWrittenEvents.length > 0) {
    console.log("Sending hand written events:", handWrittenEvents);
    try {
      send(squash(handWrittenEvents), farosConfig.handWrittenCategory());
    } catch (error) {
      console.error("Error sending hand written events:", error);
    }
    // Clear the events after logging
    clearHandWrittenEventQueue();
  }
}

// Set interval to check and log events every minute (60000 milliseconds)
setInterval(checkAndLogEvents, farosConfig.batchInterval());

export enum TextChangeType {
  Undo = "UNDO",
  Redo = "REDO",
  NoChange = "NO_CHANGE",
  Deletion = "DELETION",
  HandWrittenChar = "HAND_WRITTEN_CHAR",
  Space = "SPACE",
  AutoCloseBracket = "AUTO_CLOSE_BRACKET",
  AutoCompletion = "AUTO_COMPLETION",
  Unknown = "UNKNOWN"
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
    return TextChangeType.HandWrittenChar;
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

function registerSuggestionListener(context: vscode.ExtensionContext) {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    statusBarItem.text = "Auto-completions: 0";
    statusBarItem.tooltip = "Auto-completions Count";
    statusBarItem.show();
  }

  if (changeTextDocumentListener === null) {
    changeTextDocumentListener = vscode.workspace.onDidChangeTextDocument((event) => {
      const document = event.document;
      const updatedText = document.getText();
      const changeType = classifyTextChange(event, updatedText, previousText);

      if (changeType === TextChangeType.AutoCompletion) {
        const currentLengthChange = event.contentChanges.reduce(
          (acc, change) => acc + change.text.replace(/\s/g, "").length, 0
        );
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
          type: 'AutoCompletion',
          filename: document.fileName,
          extension: path.extname(document.fileName),
          language: document.languageId,
          repository: getGitRepoName(document.fileName),
          branch: getGitBranch(document.fileName),
        });

        farosPanel?.refresh();
      } else if (changeType === TextChangeType.HandWrittenChar) {
        addHandWrittenEvent({
          timestamp: new Date(),
          charCountChange: 1,
          type: 'HandWritten',
          filename: document.fileName,
          extension: path.extname(document.fileName),
          language: document.languageId,
          repository: getGitRepoName(document.fileName),
          branch: getGitBranch(document.fileName),
        });

        farosPanel?.refresh();
      }

      previousText = updatedText;
    });
    context.subscriptions.push(changeTextDocumentListener);
  }

  if (themeChangedListener === null) {
    themeChangedListener = vscode.window.onDidChangeActiveColorTheme((event) => {
      farosPanel?.updateTheme();
    });
    context.subscriptions.push(themeChangedListener);
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("Faros VSCode extension activate started!");
  setContext(context);
  updateConfig();
  registerSuggestionListener(context);

  farosPanel = new FarosPanel(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      FarosPanel.viewType,
      farosPanel
    )
  );

  // Set context as a global as some tests depend on it
  (global as any).testExtensionContext = context;
  console.log("Faros VSCode extension activate finished!");
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log("Faros VSCode extension is now inactive!");
}
