import * as vscode from 'vscode';
import { AutoCompletionEvent, HourlyAggregate } from './types';

const AUTOCOMPLETION_EVENTS_KEY = 'autocompletionEvents';
const AUTOCOMPLETION_HISTORY_PREFIX = 'autocompletionHistory: ';

let context: vscode.ExtensionContext;

export const setContext = (c: vscode.ExtensionContext) => {
    context = c;
};

export const getAutoCompletionEventQueue = (): Array<AutoCompletionEvent> => {
    return context.globalState.get(AUTOCOMPLETION_EVENTS_KEY, []);
};

const hourToKey = (hour: number) => `${AUTOCOMPLETION_HISTORY_PREFIX}${hour}`;

const setAutoCompletionHistory = (hour: number, aggregate: HourlyAggregate) => {
    context.globalState.update(hourToKey(hour), aggregate);
};

export const getAutoCompletionHistory = (hour: number): HourlyAggregate => {
    return context.globalState.get(hourToKey(hour)) as HourlyAggregate;
};

const dateToHour = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime();

export const getAutoCompletionHistoryForRange = (startDate: Date, endDate: Date): Array<HourlyAggregate> => {
    const history = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const hour = dateToHour(currentDate);
        const aggregate = getAutoCompletionHistory(hour);
        if (aggregate) {
            history.push(aggregate);
        }
        currentDate.setHours(currentDate.getHours() + 1);
    }
    return history;
};

export const addAutoCompletionEvent = (event: AutoCompletionEvent) => {    
    // Add to event to queue
    const queue: AutoCompletionEvent[] = getAutoCompletionEventQueue();
    queue.push(event);
    context.globalState.update(AUTOCOMPLETION_EVENTS_KEY, queue);

    // Add to history
    const hour = dateToHour(event.timestamp);
    const aggregate = getAutoCompletionHistory(hour) || { 
        hour,
        eventCount: 0, 
        charCount: 0, 
        filename: [], 
        extension: [], 
        language: [], 
        repository: [], 
        branch: [] 
    };

    aggregate.eventCount++;
    aggregate.charCount += event.charCountChange || 0;

    if (event.filename && !aggregate.filename.includes(event.filename)) {
        aggregate.filename.push(event.filename);
    }
    if (event.extension && !aggregate.extension.includes(event.extension)) {
        aggregate.extension.push(event.extension);
    }
    if (event.language && !aggregate.language.includes(event.language)) {
        aggregate.language.push(event.language);
    }
    if (event.repository && !aggregate.repository.includes(event.repository)) {
        aggregate.repository.push(event.repository);
    }
    if (event.branch && !aggregate.branch.includes(event.branch)) {
        aggregate.branch.push(event.branch);
    }

    setAutoCompletionHistory(hour, aggregate);
};

export const clearAutoCompletionEventQueue = () => {
    context.globalState.update(AUTOCOMPLETION_EVENTS_KEY, []);
};