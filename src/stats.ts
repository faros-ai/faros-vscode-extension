import * as vscode from 'vscode';
import { AutoCompletionEvent } from './types';
import { getAutoCompletionEvents, getAutoCompletionEventsHistory } from './state';

export const calculateAutoCompletionStats = (): {
    today: { count: number, timeSaved: number },
    thisWeek: { count: number, timeSaved: number },
    thisMonth: { count: number, timeSaved: number }
} => {
    const CHARS_PER_MINUTE = 300;
    const events: AutoCompletionEvent[] = [...getAutoCompletionEvents(), ...getAutoCompletionEventsHistory()];
    const now = new Date();

    const today = events.reduce((acc, event) => {
        if (isSameDay(new Date(event.timestamp), now)) {
            return {
                count: acc.count + 1,
                timeSaved: acc.timeSaved + (event.charCountChange / CHARS_PER_MINUTE)
            };
        }
        return acc;
    }, { count: 0, timeSaved: 0 });

    const thisWeek = events.reduce((acc, event) => {
        if (isThisWeek(new Date(event.timestamp), now)) {
            return {
                count: acc.count + 1,
                timeSaved: acc.timeSaved + (event.charCountChange / CHARS_PER_MINUTE)
            };
        }
        return acc;
    }, { count: 0, timeSaved: 0 });

    const thisMonth = events.reduce((acc, event) => {
        if (isSameMonth(new Date(event.timestamp), now)) {
            return {
                count: acc.count + 1,
                timeSaved: acc.timeSaved + (event.charCountChange / CHARS_PER_MINUTE)
            };
        }
        return acc;
    }, { count: 0, timeSaved: 0 });

    return { today, thisWeek, thisMonth };
};

const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

const isThisWeek = (date: Date, now: Date): boolean => {
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    return date >= weekStart && date < weekEnd;
};

const isSameMonth = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth();
};

export const getTopRepositories = (limit: number = 5): { repository: string; count: number }[] => {
    const events: AutoCompletionEvent[] = [...getAutoCompletionEvents(), ...getAutoCompletionEventsHistory()];
    const repositoryCounts = events.reduce((acc, event) => {
        if (event.repository) {
            acc[event.repository] = (acc[event.repository] || 0) + 1;
        }
        return acc;
    }, {} as { [key: string]: number });

    const sortedRepositories = Object.entries(repositoryCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, limit)
        .map(([repository, count]) => ({ repository, count }));

    return sortedRepositories;
};
