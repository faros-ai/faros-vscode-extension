import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { classifyTextChange, TextChangeType } from './extension';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	test('classifyTextChange - Undo', () => {
		const event = {
			reason: vscode.TextDocumentChangeReason.Undo,
			contentChanges: [],
			document: {} as vscode.TextDocument
		} as vscode.TextDocumentChangeEvent;
		assert.strictEqual(classifyTextChange(event, "", ""), TextChangeType.Undo);
	});

	test('classifyTextChange - Redo', () => {
		const event = {
			reason: vscode.TextDocumentChangeReason.Redo,
			contentChanges: [],
			document: {} as vscode.TextDocument
		} as vscode.TextDocumentChangeEvent;
		assert.strictEqual(classifyTextChange(event, "", ""), TextChangeType.Redo);
	});
	test('classifyTextChange - NoChange', () => {
		const event = {
			reason: undefined,
			contentChanges: [],
			document: {} as vscode.TextDocument
		} as vscode.TextDocumentChangeEvent;
		assert.strictEqual(classifyTextChange(event, "", ""), TextChangeType.NoChange);
	});
	test('classifyTextChange - Deletion', () => {
		const event = {
			reason: undefined,
			contentChanges: [{
				range: new vscode.Range(0, 0, 0, 1),
				rangeOffset: 0,
				rangeLength: 1,
				text: ""
			}],
			document: {} as vscode.TextDocument
		} as vscode.TextDocumentChangeEvent;
		assert.strictEqual(classifyTextChange(event, "", "a"), TextChangeType.Deletion);
	});

	test('classifyTextChange - HandwrittenChar', () => {
		const event = {
			reason: undefined,
			contentChanges: [{
				range: new vscode.Range(0, 0, 0, 0),
				rangeOffset: 0,
				rangeLength: 0,
				text: "a"
			}],
			document: {} as vscode.TextDocument
		} as vscode.TextDocumentChangeEvent;
		assert.strictEqual(classifyTextChange(event, "a", ""), TextChangeType.HandWrittenChar);
	});

	test('classifyTextChange - Space', () => {
		const event = {
			reason: undefined,
			contentChanges: [{
				range: new vscode.Range(0, 0, 0, 0),
				rangeOffset: 0,
				rangeLength: 0,
				text: "    "
			}],
			document: {} as vscode.TextDocument
		} as vscode.TextDocumentChangeEvent;
		assert.strictEqual(classifyTextChange(event, " ", ""), TextChangeType.Space);
	});

	test('classifyTextChange - AutoCloseBracket', () => {
		const event = {
			reason: undefined,
			contentChanges: [{
				range: new vscode.Range(0, 0, 0, 0),
				rangeOffset: 0,
				rangeLength: 0,
				text: "()"
			}],
			document: {} as vscode.TextDocument
		} as vscode.TextDocumentChangeEvent;
		assert.strictEqual(classifyTextChange(event, "()", ""), TextChangeType.AutoCloseBracket);
	});

	test('classifyTextChange - AutoCompletion', () => {
		const event = {
			reason: undefined,
			contentChanges: [{
				range: new vscode.Range(0, 0, 0, 0),
				rangeOffset: 0,
				rangeLength: 0,
				text: "console.log"
			}],
			document: {} as vscode.TextDocument
		} as vscode.TextDocumentChangeEvent;
		assert.strictEqual(classifyTextChange(event, "console.log", "cons"), TextChangeType.AutoCompletion);
	});
	test('classifyTextChange - Unknown', () => {
		const event = {
			reason: undefined,
			contentChanges: [{
				range: new vscode.Range(0, 0, 0, 0),
				rangeOffset: 0,
				rangeLength: 0,
				text: ""
			}],
			document: {} as vscode.TextDocument
		} as vscode.TextDocumentChangeEvent;
		assert.strictEqual(classifyTextChange(event, "multiple\nlines\nof\ntext", ""), TextChangeType.Unknown);
	});
});
