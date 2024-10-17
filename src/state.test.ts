import { aggregateAutoCompletionEvents } from './state';
import { AutoCompletionEvent, HourlyAggregate } from './types';
import { expect, describe, it } from '@jest/globals';

describe('aggregateAutoCompletionEvents', () => {
    it('should correctly aggregate events', () => {
        const aggregate = new Map<number, HourlyAggregate>();
        const events: AutoCompletionEvent[] = [
            {
                timestamp: new Date('2023-05-01T10:30:00'),
                charCountChange: 5,
                filename: 'test1.ts',
                extension: '.ts',
                language: 'TypeScript',
                repository: 'repo1',
                branch: 'main'
            },
            {
                timestamp: new Date('2023-05-01T10:45:00'),
                charCountChange: 10,
                filename: 'test2.ts',
                extension: '.ts',
                language: 'TypeScript',
                repository: 'repo1',
                branch: 'feature'
            }
        ];

        aggregateAutoCompletionEvents(aggregate, events);

        expect(aggregate.size).toBe(1);
        const hourlyAggregate = aggregate.get(new Date('2023-05-01T10:00:00').getTime());
        expect(hourlyAggregate).toBeDefined();
        if (hourlyAggregate) {
            expect(hourlyAggregate.eventCount).toBe(2);
            expect(hourlyAggregate.charCount).toBe(15);
            expect(hourlyAggregate.filename.size).toBe(2);
            expect(hourlyAggregate.extension.size).toBe(1);
            expect(hourlyAggregate.language.size).toBe(1);
            expect(hourlyAggregate.repository.size).toBe(1);
            expect(hourlyAggregate.branch.size).toBe(2);
        }
    });
});