import * as vscode from 'vscode';
import { AutoCompletionEvent, DocumentChangeEvent, HandWrittenEvent, HourlyAggregate, Summarization } from './types';

const AUTOCOMPLETION_EVENTS_KEY = 'autocompletionEvents';
const HANDWRITTEN_EVENTS_KEY = 'handwrittenEvents';
const HOURLY_AGGREGATE_PREFIX = 'aggregate: ';
const TOTAL_AGGREGATE_KEY = 'total';

let context: vscode.ExtensionContext;

export const setContext = (c: vscode.ExtensionContext) => {
    context = c;
};

export const getAutoCompletionEventQueue = (): AutoCompletionEvent[] => context.globalState.get<AutoCompletionEvent[]>(AUTOCOMPLETION_EVENTS_KEY, []);
export const getHandWrittenEventQueue = (): HandWrittenEvent[] => context.globalState.get<HandWrittenEvent[]>(HANDWRITTEN_EVENTS_KEY, []);

const hourToKey = (hour: number) => `${HOURLY_AGGREGATE_PREFIX}${hour}`;

const setHourlyAggregate = (hour: number, aggregate: HourlyAggregate) => {
    context.globalState.update(hourToKey(hour), aggregate);
};

export const getHourlyAggregate = (hour: number): HourlyAggregate => {
    return context.globalState.get(hourToKey(hour)) as HourlyAggregate;
};

export const setTotalAggregate = (aggregate: Summarization) => {
    context.globalState.update(TOTAL_AGGREGATE_KEY, aggregate);
};

export const getTotalAggregate = (): Summarization => {
    return context.globalState.get(TOTAL_AGGREGATE_KEY) as Summarization;
};

const dateToHour = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime();

export const getHourlyAggregateForRange = (startDate: Date, endDate: Date, pushEmpty: boolean = false): Array<HourlyAggregate> => {
    const history = [];
    let currentDate = startDate;
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    while (currentDate <= endDate) {
        const hour = dateToHour(currentDate);
        const aggregate = getHourlyAggregate(hour);
        if (aggregate) {
            history.push(aggregate);
        } else if (pushEmpty) {
            history.push({
                hour,
                totals: {
                    autoCompletionEventCount: 0,
                    autoCompletionCharCount: 0,
                    handWrittenCharCount: 0,
                },
                filenames: {},
                languages: {},
                extensions: {},
                repositories: {},
                branches: {},
            });
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

    try {
        // Add to history
        // This is wrapped in a try/catch for cases where we changed the event type and there's an error
        // when serializing/deserializing the event in between versions
        addDocumentChangeEvent(event);
    } catch (error) {
        console.error("Error adding auto completion event:", error);
    }
};

export const addHandWrittenEvent = (event: HandWrittenEvent) => {
    // Add to event to queue
    const queue: HandWrittenEvent[] = getHandWrittenEventQueue();
    queue.push(event);
    context.globalState.update(HANDWRITTEN_EVENTS_KEY, queue);

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
        autoCompletionEventCount: event.type === 'AutoCompletion' ? 1 : 0,
        autoCompletionCharCount: event.type === 'AutoCompletion' ? event.charCountChange : 0,
        handWrittenCharCount: event.type === 'HandWritten' ? event.charCountChange : 0,
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

    const totalAggregate = getTotalAggregate();
    setTotalAggregate(updateSummarization(totalAggregate, change));
}; 

export const clearAutoCompletionEventQueue = () => {
    context.globalState.update(AUTOCOMPLETION_EVENTS_KEY, []);
};

export const clearHandWrittenEventQueue = () => {
    context.globalState.update(HANDWRITTEN_EVENTS_KEY, []);
};
