import * as assert from 'assert';
import { squash } from './sender';
import { DocumentChangeEvent } from './types';

suite('squash', () => {
  test('should combine events in the same minute for the same file', () => {
    const baseTime = new Date('2024-01-01T10:30:45.123Z');
    const events: DocumentChangeEvent[] = [
      {
          timestamp: baseTime,
          filename: 'test.ts',
          charCountChange: 10,
          repository: 'repo',
          branch: 'main',
          type: 'HandWritten'
      },
      {
          timestamp: new Date('2024-01-01T10:30:55.456Z'), // Same minute
          filename: 'test.ts',
          charCountChange: 5,
          repository: 'repo',
          branch: 'main',
          type: 'HandWritten'
      },
    ];

    const result = squash(events);
    assert.strictEqual(result.length, 1);
    assert.deepStrictEqual(result[0], {
      timestamp: baseTime,
      filename: 'test.ts',
      charCountChange: 15, // 10 + 5
      repository: 'repo',
      branch: 'main',
      type: 'HandWritten'
    });
  });

  test('should keep events in different minutes separate', () => {
    const events: DocumentChangeEvent[] = [
      {
          timestamp: new Date('2024-01-01T10:30:45.123Z'),
          filename: 'test.ts',
          charCountChange: 10,
          type: 'HandWritten'
      },
      {
          timestamp: new Date('2024-01-01T10:31:00.000Z'), // Different minute
          filename: 'test.ts',
          charCountChange: 5,
          type: 'HandWritten'
      },
    ];

    const result = squash(events);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].charCountChange, 10);
    assert.strictEqual(result[1].charCountChange, 5);
  });

  test('should keep events for different files separate within same minute', () => {
    const baseTime = new Date('2024-01-01T10:30:45.123Z');
    const events: DocumentChangeEvent[] = [
      {
          timestamp: baseTime,
          filename: 'test1.ts',
          charCountChange: 10,
          type: 'HandWritten'
      },
      {
          timestamp: baseTime,
          filename: 'test2.ts',
          charCountChange: 5,
          type: 'HandWritten'
      },
    ];

    const result = squash(events);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result.find(e => e.filename === 'test1.ts')?.charCountChange, 10);
    assert.strictEqual(result.find(e => e.filename === 'test2.ts')?.charCountChange, 5);
  });

  test('should handle events with no filename', () => {
    const baseTime = new Date('2024-01-01T10:30:45.123Z');
    const events: DocumentChangeEvent[] = [
      {
          timestamp: baseTime,
          charCountChange: 10,
          type: 'HandWritten'
      },
      {
          timestamp: baseTime,
          charCountChange: 5,
          type: 'HandWritten'
      },
    ];

    const result = squash(events);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].charCountChange, 15);
    assert.strictEqual(result[0].filename, undefined);
  });

  test('should preserve other properties from first event in group', () => {
    const baseTime = new Date('2024-01-01T10:30:45.123Z');
    const events: DocumentChangeEvent[] = [
      {
          timestamp: baseTime,
          filename: 'test.ts',
          charCountChange: 10,
          repository: 'repo1',
          branch: 'main',
          language: 'typescript',
          type: 'HandWritten'
      },
      {
          timestamp: baseTime,
          filename: 'test.ts',
          charCountChange: 5,
          repository: 'repo2',
          branch: 'feature',
          language: 'typescript',
          type: 'HandWritten'
      },
    ];

    const result = squash(events);
    assert.strictEqual(result.length, 1);
    assert.deepStrictEqual(result[0], {
      timestamp: baseTime,
      filename: 'test.ts',
      charCountChange: 15,
      repository: 'repo1',
      branch: 'main',
      language: 'typescript',
      type: 'HandWritten'
    });
  });
});
