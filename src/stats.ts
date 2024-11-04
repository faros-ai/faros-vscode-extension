import { getHourlyAggregateForRange } from './state';
import { HourlyAggregate } from './types';

export const CHARS_PER_MINUTE = 300;

export const calculateAutoCompletionStats = (now: Date = new Date()): {
    today: { count: number, timeSaved: number },
    thisWeek: { count: number, timeSaved: number },
    thisMonth: { count: number, timeSaved: number }
} => {    
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayHistory = getHourlyAggregateForRange(startOfDay, now);
    const weekHistory = getHourlyAggregateForRange(startOfWeek, now);
    const monthHistory = getHourlyAggregateForRange(startOfMonth, now);

    const calculateStats = (history: Array<HourlyAggregate>) => {
        return history.reduce((acc, aggregate) => {
            return {
                count: acc.count + aggregate.totals.autoCompletionEventCount,
                timeSaved: acc.timeSaved + (aggregate.totals.autoCompletionCharCount / CHARS_PER_MINUTE)
            };
        }, { count: 0, timeSaved: 0 });
    };

    const today = calculateStats(todayHistory);
    const thisWeek = calculateStats(weekHistory);
    const thisMonth = calculateStats(monthHistory);

    return { today, thisWeek, thisMonth };
};

export const calculateRatios = (now: Date = new Date()): {
    today: number,
    thisWeek: number,
    thisMonth: number
} => {
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayHistory = getHourlyAggregateForRange(startOfDay, now);
    const weekHistory = getHourlyAggregateForRange(startOfWeek, now);
    const monthHistory = getHourlyAggregateForRange(startOfMonth, now);

    const calculateRatios = (history: Array<HourlyAggregate>) => {
        return history.reduce((acc, aggregate) => {
            return {
                autoCompletedChars: acc.autoCompletedChars + aggregate.totals.autoCompletionCharCount,
                handWrittenChars: acc.handWrittenChars + aggregate.totals.handWrittenCharCount
            };
        }, { autoCompletedChars: 0, handWrittenChars: 0 });
    };

    const today = calculateRatios(todayHistory);
    const thisWeek = calculateRatios(weekHistory);
    const thisMonth = calculateRatios(monthHistory);

    return { 
        today: today.autoCompletedChars / (today.autoCompletedChars + today.handWrittenChars), 
        thisWeek: thisWeek.autoCompletedChars / (thisWeek.autoCompletedChars + thisWeek.handWrittenChars), 
        thisMonth: thisMonth.autoCompletedChars / (thisMonth.autoCompletedChars + thisMonth.handWrittenChars) 
    };
};

export const getTopRepositories = (limit: number = 5, now: Date = new Date()): { repository: string; count: number }[] => {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const history = getHourlyAggregateForRange(startOfMonth, now);
    
    const repositoryCounts: { [key: string]: number } = {};
    history.forEach(aggregate => {
        if (aggregate.repositories) {
            Object.keys(aggregate.repositories).forEach(repo => {
                repositoryCounts[repo] = (repositoryCounts[repo] || 0) + aggregate.repositories[repo].autoCompletionEventCount;
            });
        }
    });

    const sortedRepositories = Object.entries(repositoryCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, limit)
        .map(([repository, count]) => ({ repository, count }));
    
    return sortedRepositories;
};
