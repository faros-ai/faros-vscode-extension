import * as vscode from 'vscode';
import { AutoCompletionEvent, DocumentChangeEvent, HandWrittenEvent, HourlyAggregate, Summarization } from './types';

const AUTOCOMPLETION_EVENTS_KEY = 'autocompletionEvents';
const HOURLY_AGGREGATE_PREFIX = 'aggregate: ';

let context: vscode.ExtensionContext;

export const setContext = (c: vscode.ExtensionContext) => {
    context = c;
};

export const getAutoCompletionEventQueue = (): AutoCompletionEvent[] => context.globalState.get<AutoCompletionEvent[]>(AUTOCOMPLETION_EVENTS_KEY, []);

const hourToKey = (hour: number) => `${HOURLY_AGGREGATE_PREFIX}${hour}`;

const setHourlyAggregate = (hour: number, aggregate: HourlyAggregate) => {
    context.globalState.update(hourToKey(hour), aggregate);
};

export const getHourlyAggregate = (hour: number): HourlyAggregate => {
    return context.globalState.get(hourToKey(hour)) as HourlyAggregate;
};

const dateToHour = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime();

export const getHourlyAggregateForRange = (startDate: Date, endDate: Date): Array<HourlyAggregate> => {
    const history = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
        const hour = dateToHour(currentDate);
        const aggregate = getHourlyAggregate(hour);
        if (aggregate) {
            history.push(aggregate);
        }
        currentDate.setHours(currentDate.getHours() + 1);
    }
    return history;
};

// Updates the summarization for a given key, creating it if it doesn't exist
const updateSummarization = (summarization: Summarization | undefined, change: Summarization): Summarization => {
    const newSummarization = summarization ? { ...summarization } : {
        autoCompletionEventCount: 0,
        autoCompletionCharCount: 0,
        handWrittenCharCount: 0,
    };

    newSummarization.autoCompletionEventCount += change.autoCompletionEventCount;
    newSummarization.autoCompletionCharCount += change.autoCompletionCharCount;
    newSummarization.handWrittenCharCount += change.handWrittenCharCount;

    return newSummarization;
};

export const addAutoCompletionEvent = (event: AutoCompletionEvent) => {    
    // Add to event to queue
    const queue: AutoCompletionEvent[] = getAutoCompletionEventQueue();
    queue.push(event);
    context.globalState.update(AUTOCOMPLETION_EVENTS_KEY, queue);

    // Add to history
    addDocumentChangeEvent(event);
};

export const addHandWrittenEvent = (event: HandWrittenEvent) => {
    // Add to history
    addDocumentChangeEvent(event);
};

const addDocumentChangeEvent = (event: DocumentChangeEvent) => {
    const hour = dateToHour(event.timestamp);
    const aggregate = getHourlyAggregate(hour) || { 
        hour,
        totals: undefined,
        filenames: {}, 
        languages: {}, 
        extensions: {}, 
        repositories: {}, 
        branches: {} 
    };

    const change = {
        autoCompletionEventCount: event.autoCompletionCharCountChange ? 1 : 0,
        autoCompletionCharCount: event.autoCompletionCharCountChange || 0,
        handWrittenCharCount: event.handWrittenCharCountChange || 0,
    };

    aggregate.totals = updateSummarization(aggregate.totals, change);

    if (event.filename) {
        aggregate.filenames[event.filename] = updateSummarization(aggregate.filenames[event.filename], change);
    }
    if (event.extension) {
        aggregate.extensions[event.extension] = updateSummarization(aggregate.extensions[event.extension], change);
    }
    if (event.language) {
        aggregate.languages[event.language] = updateSummarization(aggregate.languages[event.language], change);
    }
    if (event.repository) {
        aggregate.repositories[event.repository] = updateSummarization(aggregate.repositories[event.repository], change);
    }
    if (event.branch) {
        aggregate.branches[event.branch] = updateSummarization(aggregate.branches[event.branch], change);
    }

    setHourlyAggregate(hour, aggregate);
}; 

export const clearAutoCompletionEventQueue = () => {
    context.globalState.update(AUTOCOMPLETION_EVENTS_KEY, []);
};
