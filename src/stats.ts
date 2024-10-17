import * as vscode from 'vscode';
import { AutoCompletionEvent, HourlyAggregate } from './types';
import { getAutoCompletionEvents, getAutoCompletionHistory } from './state';

export const calculateAutoCompletionStats = (): {
    today: { count: number, timeSaved: number },
    thisWeek: { count: number, timeSaved: number },
    thisMonth: { count: number, timeSaved: number }
} => {
    const CHARS_PER_MINUTE = 300;
    
    const history = getAutoCompletionHistory();
    const now = new Date();

    const today = Array.from(history.values()).reduce((acc, aggregate) => {
        if (isSameDay(new Date(aggregate.hour), now)) {
            return {
                count: acc.count + 1,
                timeSaved: acc.timeSaved + (aggregate.charCount / CHARS_PER_MINUTE)
            };
        }
        return acc;
    }, { count: 0, timeSaved: 0 });

    const thisWeek = Array.from(history.values()).reduce((acc, aggregate) => {
        if (isThisWeek(new Date(aggregate.hour), now)) {
            return {
                count: acc.count + 1,
                timeSaved: acc.timeSaved + (aggregate.charCount / CHARS_PER_MINUTE)
            };
        }
        return acc;
    }, { count: 0, timeSaved: 0 });

    const thisMonth = Array.from(history.values()).reduce((acc, aggregate) => {
        if (isSameMonth(new Date(aggregate.hour), now)) {
            return {
                count: acc.count + 1,
                timeSaved: acc.timeSaved + (aggregate.charCount / CHARS_PER_MINUTE)
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
    const history = getAutoCompletionHistory();
    const repositoryCounts = Array.from(history.values()).reduce((acc, aggregate) => {
        if (aggregate.repository) {
            aggregate.repository.forEach(repo => {
                acc[repo] = (acc[repo] || 0) + 1;
            });
        }
        return acc;
    }, {} as { [key: string]: number });

    const sortedRepositories = Object.entries(repositoryCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, limit)
        .map(([repository, count]) => ({ repository, count }));

    return sortedRepositories;
};
