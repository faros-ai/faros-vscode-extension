import * as vscode from 'vscode';
import { AutoCompletionEvent } from './types';

const AUTOCOMPLETION_EVENTS_KEY = 'autocompletionEvents';
const AUTOCOMPLETION_EVENTS_HISTORY_KEY = 'autocompletionEventsHistory';

let context: vscode.ExtensionContext;

export const setContext = (c: vscode.ExtensionContext) => {
    context = c;
};

export const getAutoCompletionEvents = (): AutoCompletionEvent[] => {
    return context.globalState.get(AUTOCOMPLETION_EVENTS_KEY, []);
};

export const addAutoCompletionEvent = (event: AutoCompletionEvent) => {
    const events: AutoCompletionEvent[] = getAutoCompletionEvents();
    events.push(event);
    context.globalState.update(AUTOCOMPLETION_EVENTS_KEY, events);
};

const getAutoCompletionEventsHistory = (): AutoCompletionEvent[] => {
    return context.globalState.get(AUTOCOMPLETION_EVENTS_HISTORY_KEY, []);
};

const addAutoCompletionEventsHistory = (events: AutoCompletionEvent[]) => {
    const history: AutoCompletionEvent[] = getAutoCompletionEventsHistory();
    history.push(...events);
    context.globalState.update(AUTOCOMPLETION_EVENTS_HISTORY_KEY, history);
};

export const clearAutoCompletionEvents = () => {
    addAutoCompletionEventsHistory(getAutoCompletionEvents());
    context.globalState.update(AUTOCOMPLETION_EVENTS_KEY, []);
};

