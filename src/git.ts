import { execSync } from 'child_process';
import * as path from 'path';

export const getGitBranch = (filePath: string): string => {
    try {
        const branch = execSync(`git -C "${path.dirname(filePath)}" rev-parse --abbrev-ref HEAD`, { encoding: 'utf-8' }).trim();
        return branch;
    } catch (error) {
        console.error('Error getting current Git branch:', error);
        return '';
    }
};

export const getGitRepoName = (filePath: string): string => {
    try {
        const repoName = execSync(`git -C "${path.dirname(filePath)}" rev-parse --show-toplevel`, { encoding: 'utf-8' })
            .trim()
            .split('/')
            .pop();
        return repoName || '';
    } catch (error) {
        console.error('Error getting current Git repository name:', error);
        return '';
    }
};

export const getCurrentGitCommit = (filePath: string): string => {
    try {
        const commit = execSync(`git -C "${path.dirname(filePath)}" rev-parse HEAD`, { encoding: 'utf-8' }).trim();
        return commit;
    } catch (error) {
        console.error('Error getting current Git commit:', error);
        return '';
    }
};

export const getGitUserName = (): string => {
    try {
        const user = execSync('git config user.name', { encoding: 'utf-8' }).trim();
        return user;
    } catch (error) {
        console.error('Error getting current Git user:', error);
        return '';
    }
};

export const getGitUserEmail = (): string => {
    try {
        const userId = execSync('git config user.email', { encoding: 'utf-8' }).trim();
        return userId;
    } catch (error) {
        console.error('Error getting current Git user ID:', error);
        return '';
    }
};
