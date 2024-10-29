import * as vscode from 'vscode';
import * as assert from 'assert';
import { calculateAutoCompletionStats, CHARS_PER_MINUTE, getTopRepositories } from './stats';
import { AutoCompletionEvent } from './types';
import { addAutoCompletionEvent, setContext } from './state';
import { clearGlobalState } from './util';

const now = new Date();
const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

suite('Stats Test Suite', () => {
    setup(async () => {
        await vscode.extensions.getExtension("farosai.faros-vscode-extension")?.activate();
        const extensionContext = (global as any).testExtensionContext;
        clearGlobalState(extensionContext);
        setContext(extensionContext);
    });

    test('calculateAutoCompletionStats should calculate stats correctly for today, this week, and this month', async () => {
        const events: AutoCompletionEvent[] = [
            { timestamp: startOfDay, charCountChange: 5*CHARS_PER_MINUTE, filename: 'file1.ts', extension: '.ts', language: 'TypeScript', repository: 'repo1', branch: 'main' },
            { timestamp: startOfDay, charCountChange: 15*CHARS_PER_MINUTE, filename: 'file2.js', extension: '.js', language: 'JavaScript', repository: 'repo2', branch: 'feature' },
            { timestamp: startOfDay, charCountChange: 25*CHARS_PER_MINUTE, filename: 'file3.py', extension: '.py', language: 'Python', repository: 'repo3', branch: 'develop' },
            { timestamp: startOfDay, charCountChange: 10*CHARS_PER_MINUTE, filename: 'file4.ts', extension: '.ts', language: 'TypeScript', repository: 'repo1', branch: 'main' },
            { timestamp: startOfWeek, charCountChange: 30*CHARS_PER_MINUTE, filename: 'file2.js', extension: '.js', language: 'JavaScript', repository: 'repo2', branch: 'main' },
            { timestamp: startOfWeek, charCountChange: 10*CHARS_PER_MINUTE, filename: 'file4.js', extension: '.ts', language: 'JavaScript', repository: 'repo2', branch: 'main' },
            { timestamp: startOfMonth, charCountChange: 10*CHARS_PER_MINUTE, filename: 'file3.js', extension: '.py', language: 'JavaScript', repository: 'repo2', branch: 'main' },
        ];

        events.forEach(addAutoCompletionEvent);

        const result = calculateAutoCompletionStats();

        assert.deepStrictEqual(result, {
            today: { count: 4, timeSaved: 55 },
            thisWeek: { count: 6, timeSaved: 95 },
            thisMonth: { count: 7, timeSaved: 105 },
        });

        
    });

    test('getTopRepositories should return top repositories correctly', async () => {
        const events: AutoCompletionEvent[] = [
            { timestamp: startOfDay, charCountChange: 5*CHARS_PER_MINUTE, filename: 'file1.ts', extension: '.ts', language: 'TypeScript', repository: 'repo1', branch: 'main' },
            { timestamp: startOfDay, charCountChange: 15*CHARS_PER_MINUTE, filename: 'file2.js', extension: '.js', language: 'JavaScript', repository: 'repo2', branch: 'feature' },
            { timestamp: startOfDay, charCountChange: 25*CHARS_PER_MINUTE, filename: 'file3.py', extension: '.py', language: 'Python', repository: 'repo3', branch: 'develop' },
            { timestamp: startOfDay, charCountChange: 10*CHARS_PER_MINUTE, filename: 'file4.ts', extension: '.ts', language: 'TypeScript', repository: 'repo1', branch: 'main' },
            { timestamp: startOfWeek, charCountChange: 30*CHARS_PER_MINUTE, filename: 'file2.js', extension: '.js', language: 'JavaScript', repository: 'repo2', branch: 'main' },
            { timestamp: startOfWeek, charCountChange: 10*CHARS_PER_MINUTE, filename: 'file4.js', extension: '.ts', language: 'JavaScript', repository: 'repo2', branch: 'main' },
            { timestamp: startOfMonth, charCountChange: 10*CHARS_PER_MINUTE, filename: 'file3.js', extension: '.py', language: 'JavaScript', repository: 'repo2', branch: 'main' },
        ];

        events.forEach(addAutoCompletionEvent);

        const result = getTopRepositories(3);

        assert.deepStrictEqual(result, [
            { repository: 'repo2', count: 7 },
            { repository: 'repo1', count: 4 },
            { repository: 'repo3', count: 4 },
        ]);
    });
});