import * as vscode from 'vscode';
import * as assert from 'assert';
import { getAutoCompletionEventQueue, addAutoCompletionEvent, clearAutoCompletionEventQueue, setContext } from './state';
import { AutoCompletionEvent } from './types';
import { clearGlobalState } from './util';

suite('State Test Suite', () => {
    setup(async () => {
        await vscode.extensions.getExtension("farosai.faros-vscode-extension")?.activate();
        const extensionContext = (global as any).testExtensionContext;
        clearGlobalState(extensionContext);
        setContext(extensionContext);
    });

    test('getAutoCompletionEventQueue should return an empty array when no events are stored', () => {
        const result = getAutoCompletionEventQueue();
        assert.deepStrictEqual(result, []);
    });
    test('getAutoCompletionEventQueue should return stored events', () => {
        const event: AutoCompletionEvent = {
            timestamp: new Date(),
            autoCompletionCharCountChange: 10,
            filename: "test.py",
            extension: "py",
            language: "python",
            repository: "test",
            branch: "main"
          };
        addAutoCompletionEvent(event);
        const result = getAutoCompletionEventQueue();
        assert.deepStrictEqual(result, [event]);
    });

    test('clearAutoCompletionEventQueue should clear the event queue', () => {
        const event: AutoCompletionEvent = {
            timestamp: new Date(),
            autoCompletionCharCountChange: 10,
            filename: "test.py",
            extension: "py",
            language: "python",
            repository: "test",
            branch: "main"
          };
        addAutoCompletionEvent(event);
        clearAutoCompletionEventQueue();
        const result = getAutoCompletionEventQueue();
        assert.deepStrictEqual(result, []);
    });
});
