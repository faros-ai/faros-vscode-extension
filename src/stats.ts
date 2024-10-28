import { getAutoCompletionHistoryForRange } from './state';
import { HourlyAggregate } from './types';

export const CHARS_PER_MINUTE = 300;

export const calculateAutoCompletionStats = (): {
    today: { count: number, timeSaved: number },
    thisWeek: { count: number, timeSaved: number },
    thisMonth: { count: number, timeSaved: number }
} => {    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayHistory = getAutoCompletionHistoryForRange(startOfDay, now);
    const weekHistory = getAutoCompletionHistoryForRange(startOfWeek, now);
    const monthHistory = getAutoCompletionHistoryForRange(startOfMonth, now);

    const calculateStats = (history: Array<HourlyAggregate>) => {
        return history.reduce((acc, aggregate) => {
            return {
                count: acc.count + aggregate.eventCount,
                timeSaved: acc.timeSaved + (aggregate.charCount / CHARS_PER_MINUTE)
            };
        }, { count: 0, timeSaved: 0 });
    };

    const today = calculateStats(todayHistory);
    const thisWeek = calculateStats(weekHistory);
    const thisMonth = calculateStats(monthHistory);

    return { today, thisWeek, thisMonth };
};

export const getTopRepositories = (limit: number = 5): { repository: string; count: number }[] => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const history = getAutoCompletionHistoryForRange(startOfMonth, now);
            
    const repositoryCounts: { [key: string]: number } = {};
    history.forEach(aggregate => {
        if (Array.isArray(aggregate.repository)) {
            aggregate.repository.forEach(repo => {
                repositoryCounts[repo] = (repositoryCounts[repo] || 0) + aggregate.eventCount;
            });
        }
    });

    const sortedRepositories = Object.entries(repositoryCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, limit)
        .map(([repository, count]) => ({ repository, count }));
    
    return sortedRepositories;
};
