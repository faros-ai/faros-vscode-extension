import * as vscode from 'vscode';
import { AutoCompletionEvent, HourlyAggregate } from './types';

const AUTOCOMPLETION_EVENTS_KEY = 'autocompletionEvents';
const AUTOCOMPLETION_HISTORY_KEY = 'autocompletionHistory';

let context: vscode.ExtensionContext;

export const setContext = (c: vscode.ExtensionContext) => {
    context = c;
};

export const getAutoCompletionEvents = (): AutoCompletionEvent[] => {
    return context.globalState.get(AUTOCOMPLETION_EVENTS_KEY, []);
};

export const addAutoCompletionEvent = (event: AutoCompletionEvent) => {
    console.log('Adding auto-completion event:', event);
    const events: AutoCompletionEvent[] = getAutoCompletionEvents();
    events.push(event);
    context.globalState.update(AUTOCOMPLETION_EVENTS_KEY, events);
};

export const getAutoCompletionHistory = (): Map<number, HourlyAggregate> => {
    return context.globalState.get(AUTOCOMPLETION_HISTORY_KEY, new Map<number, HourlyAggregate>());
};

export const aggregateAutoCompletionEvents = (aggregate: Map<number, HourlyAggregate>, events: AutoCompletionEvent[]) => {
    events.forEach(event => {
        const hour = new Date(event.timestamp.getFullYear(), event.timestamp.getMonth(), event.timestamp.getDate(), event.timestamp.getHours()).getTime();
        const current = aggregate.get(hour) || { 
            hour,
            eventCount: 0, 
            charCount: 0, 
            filename: new Set<string>(), 
            extension: new Set<string>(), 
            language: new Set<string>(), 
            repository: new Set<string>(), 
            branch: new Set<string>() 
        } as HourlyAggregate;
        
        current.eventCount++;
        current.charCount += event.charCountChange || 0;
        if (event.filename) { current.filename.add(event.filename); }
        if (event.extension) { current.extension.add(event.extension); }
        if (event.language) { current.language.add(event.language); }
        if (event.repository) { current.repository.add(event.repository); }
        if (event.branch) { current.branch.add(event.branch); }
        
        aggregate.set(hour, current);
    });
};

const updateAutoCompletionHistory = (events: AutoCompletionEvent[]) => {
    const history = getAutoCompletionHistory();
    aggregateAutoCompletionEvents(history, events);
    context.globalState.update(AUTOCOMPLETION_HISTORY_KEY, history);
};

export const clearAutoCompletionEvents = () => {
    updateAutoCompletionHistory(getAutoCompletionEvents());
    context.globalState.update(AUTOCOMPLETION_EVENTS_KEY, []);
};

