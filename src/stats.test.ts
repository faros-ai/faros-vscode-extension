import * as vscode from 'vscode';
import * as assert from 'assert';
import { calculateAutoCompletionStats, CHARS_PER_MINUTE, getRecentHourlyChartData, getTopLanguages, getTopRepositories } from './stats';
import { AutoCompletionEvent } from './types';
import { addAutoCompletionEvent, addHandWrittenEvent, setContext } from './state';
import { clearGlobalState } from './util';

const now = new Date(2024, 9, 17);
const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const startOfYear = new Date(now.getFullYear(), 1, 1);

suite('Stats Test Suite', () => {
    setup(async () => {
        await vscode.extensions.getExtension("farosai.faros-vscode-extension")?.activate();
        const extensionContext = (global as any).testExtensionContext;
        clearGlobalState(extensionContext);
        setContext(extensionContext);
    });

    test('calculateAutoCompletionStats should calculate stats correctly for today, this week, and this month', async () => {
        const events: AutoCompletionEvent[] = [
            { timestamp: startOfDay, autoCompletionCharCountChange: 5*CHARS_PER_MINUTE, filename: 'file1.ts', extension: '.ts', language: 'TypeScript', repository: 'repo1', branch: 'main' },
            { timestamp: startOfDay, autoCompletionCharCountChange: 15*CHARS_PER_MINUTE, filename: 'file2.js', extension: '.js', language: 'JavaScript', repository: 'repo2', branch: 'feature' },
            { timestamp: startOfDay, autoCompletionCharCountChange: 25*CHARS_PER_MINUTE, filename: 'file3.py', extension: '.py', language: 'Python', repository: 'repo3', branch: 'develop' },
            { timestamp: startOfDay, autoCompletionCharCountChange: 10*CHARS_PER_MINUTE, filename: 'file4.ts', extension: '.ts', language: 'TypeScript', repository: 'repo1', branch: 'main' },
            { timestamp: startOfWeek, autoCompletionCharCountChange: 30*CHARS_PER_MINUTE, filename: 'file2.js', extension: '.js', language: 'JavaScript', repository: 'repo2', branch: 'main' },
            { timestamp: startOfWeek, autoCompletionCharCountChange: 10*CHARS_PER_MINUTE, filename: 'file4.js', extension: '.ts', language: 'JavaScript', repository: 'repo2', branch: 'main' },
            { timestamp: startOfMonth, autoCompletionCharCountChange: 10*CHARS_PER_MINUTE, filename: 'file3.js', extension: '.py', language: 'JavaScript', repository: 'repo2', branch: 'main' },
            { timestamp: startOfYear, autoCompletionCharCountChange: 10*CHARS_PER_MINUTE, filename: 'file3.js', extension: '.py', language: 'JavaScript', repository: 'repo2', branch: 'main' },
        ];

        events.forEach(addAutoCompletionEvent);

        const result = calculateAutoCompletionStats(now);

        assert.deepStrictEqual(result, {
            today: { count: 4, timeSaved: 55 },
            thisWeek: { count: 6, timeSaved: 95 },
            thisMonth: { count: 7, timeSaved: 105 },
            total: { count: 8, timeSaved: 115 },
        });

        
    });

    test('getTopRepositories should return top repositories correctly', async () => {
        const events: AutoCompletionEvent[] = [
            { timestamp: startOfDay, autoCompletionCharCountChange: 5*CHARS_PER_MINUTE, filename: 'file1.ts', extension: '.ts', language: 'TypeScript', repository: 'repo1', branch: 'main' },
            { timestamp: startOfDay, autoCompletionCharCountChange: 15*CHARS_PER_MINUTE, filename: 'file2.js', extension: '.js', language: 'JavaScript', repository: 'repo2', branch: 'feature' },
            { timestamp: startOfDay, autoCompletionCharCountChange: 25*CHARS_PER_MINUTE, filename: 'file3.py', extension: '.py', language: 'Python', repository: 'repo3', branch: 'develop' },
            { timestamp: startOfDay, autoCompletionCharCountChange: 10*CHARS_PER_MINUTE, filename: 'file4.ts', extension: '.ts', language: 'TypeScript', repository: 'repo1', branch: 'main' },
            { timestamp: startOfWeek, autoCompletionCharCountChange: 30*CHARS_PER_MINUTE, filename: 'file2.js', extension: '.js', language: 'JavaScript', repository: 'repo2', branch: 'main' },
            { timestamp: startOfWeek, autoCompletionCharCountChange: 10*CHARS_PER_MINUTE, filename: 'file4.js', extension: '.ts', language: 'JavaScript', repository: 'repo2', branch: 'main' },
            { timestamp: startOfMonth, autoCompletionCharCountChange: 10*CHARS_PER_MINUTE, filename: 'file3.js', extension: '.py', language: 'JavaScript', repository: 'repo2', branch: 'main' },
        ];

        events.forEach(addAutoCompletionEvent);

        const result = getTopRepositories(3, now);

        assert.deepStrictEqual(result, [
            { repository: 'repo2', count: 4 },
            { repository: 'repo1', count: 2 },
            { repository: 'repo3', count: 1 },
        ]);
    });

    test('getTopLanguages should return top languages correctly', async () => {
        const events: AutoCompletionEvent[] = [
            { timestamp: startOfDay, autoCompletionCharCountChange: 5*CHARS_PER_MINUTE, filename: 'file1.ts', extension: '.ts', language: 'TypeScript', repository: 'repo1', branch: 'main' },
            { timestamp: startOfDay, autoCompletionCharCountChange: 15*CHARS_PER_MINUTE, filename: 'file2.js', extension: '.js', language: 'JavaScript', repository: 'repo2', branch: 'feature' },
            { timestamp: startOfDay, autoCompletionCharCountChange: 20*CHARS_PER_MINUTE, filename: 'file3.js', extension: '.js', language: 'JavaScript', repository: 'repo2', branch: 'main' },
            { timestamp: startOfDay, autoCompletionCharCountChange: 10*CHARS_PER_MINUTE, filename: 'file4.js', extension: '.js', language: 'JavaScript', repository: 'repo3', branch: 'feature' },
            { timestamp: startOfDay, autoCompletionCharCountChange: 25*CHARS_PER_MINUTE, filename: 'file3.py', extension: '.py', language: 'Python', repository: 'repo3', branch: 'develop' },
            { timestamp: startOfDay, autoCompletionCharCountChange: 15*CHARS_PER_MINUTE, filename: 'file5.py', extension: '.py', language: 'Python', repository: 'repo1', branch: 'main' },
            { timestamp: startOfDay, autoCompletionCharCountChange: 10*CHARS_PER_MINUTE, filename: 'file6.rs', extension: '.rs', language: 'Rust', repository: 'repo4', branch: 'main' },
            { timestamp: startOfDay, autoCompletionCharCountChange: 20*CHARS_PER_MINUTE, filename: 'file7.go', extension: '.go', language: 'Go', repository: 'repo5', branch: 'feature' },
            { timestamp: startOfDay, autoCompletionCharCountChange: 30*CHARS_PER_MINUTE, filename: 'file8.java', extension: '.java', language: 'Java', repository: 'repo2', branch: 'develop' },
            { timestamp: startOfDay, autoCompletionCharCountChange: 25*CHARS_PER_MINUTE, filename: 'file9.cpp', extension: '.cpp', language: 'C++', repository: 'repo6', branch: 'main' }
        ];

        events.forEach(addAutoCompletionEvent);

        const result = getTopLanguages(8, now);

        assert.deepStrictEqual(result, [
            { language: 'JavaScript', count: 3 },
            { language: 'Python', count: 2 },
            { language: 'C++', count: 1 },
            { language: 'Go', count: 1 },
            { language: 'Java', count: 1 },
            { language: 'Rust', count: 1 },
            { language: 'TypeScript', count: 1 },
        ]);
    });

    test('getRecentHourlyChartData should return correct chart data', async () => {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

        addAutoCompletionEvent({ timestamp: now, autoCompletionCharCountChange: 100, filename: 'file1.ts', extension: '.ts', language: 'TypeScript', repository: 'repo1', branch: 'main' });
        addAutoCompletionEvent({ timestamp: oneHourAgo, autoCompletionCharCountChange: 200, filename: 'file2.js', extension: '.js', language: 'JavaScript', repository: 'repo2', branch: 'feature' });
        addAutoCompletionEvent({ timestamp: twoHoursAgo, autoCompletionCharCountChange: 300, filename: 'file3.py', extension: '.py', language: 'Python', repository: 'repo3', branch: 'develop' });

        addHandWrittenEvent({ timestamp: now, handWrittenCharCountChange: 50, filename: 'file1.ts', extension: '.ts', language: 'TypeScript', repository: 'repo1', branch: 'main' });
        addHandWrittenEvent({ timestamp: oneHourAgo, handWrittenCharCountChange: 75, filename: 'file2.js', extension: '.js', language: 'JavaScript', repository: 'repo2', branch: 'feature' });
        addHandWrittenEvent({ timestamp: twoHoursAgo, handWrittenCharCountChange: 100, filename: 'file3.py', extension: '.py', language: 'Python', repository: 'repo3', branch: 'develop' });

        const result = getRecentHourlyChartData(3, now);

        assert.strictEqual(result.length, 4);
        
        // Most recent hour
        assert.strictEqual(result[3].values[0], 100); // Auto-completed chars
        assert.strictEqual(result[3].values[1], 50);   // Handwritten chars

        // One hour ago
        assert.strictEqual(result[2].values[0], 200);
        assert.strictEqual(result[2].values[1], 75);

        // Two hours ago
        assert.strictEqual(result[1].values[0], 300);
        assert.strictEqual(result[1].values[1], 100);
    });
});