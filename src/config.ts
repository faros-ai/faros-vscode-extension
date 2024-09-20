import * as vscode from "vscode";

const config = vscode.workspace.getConfiguration('faros');

import * as fs from 'fs';
import * as path from 'path';
import gitUserName from "git-user-name";
import gitUserEmail from "git-user-email";
import gitUsername from "git-username";

export interface FarosConfig {
  apiKey: () => string;
  vcsUid: () => string;
  vcsEmail: () => string;
  vcsName: () => string;
  url: () => string;
  graph: () => string;
  origin: () => string;
  batchSize: () => number;
  batchInterval: () => number;
}

export const farosConfig: FarosConfig = {
  apiKey: () => config.get('apiKey') || '',
  vcsUid: () => config.get('vcsUid') || '',
  vcsEmail: () => config.get('vcsEmail') || gitUserEmail() || '',
  vcsName: () => config.get('vcsName') || gitUserName() || '',
  url: () => config.get('url') || 'https://prod.api.faros.ai',
  graph: () => config.get('graph') || 'default',
  origin: () => config.get('origin') || 'faros-vscode-extension',
  batchSize: () => config.get('batchSize') || 500,
  batchInterval: () => Number(config.get('batchInterval')) || 60000,
};

export function updateConfig(): void {
  const configPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.vscode', 'extensions', 'faros', '.config.json');

  if (fs.existsSync(configPath)) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      Object.entries(fileConfig).forEach(([key, value]) => {
        config.update(key, value, vscode.ConfigurationTarget.Global);
      });
    } catch (error) {
      console.error('Error reading .faros-config.json:', error);
    }
  }

  if (config.get('vcsName') === undefined || config.get('vcsName') === '') { 
    config.update('vcsName', gitUserName() || '', vscode.ConfigurationTarget.Global);
  }
  if (config.get('vcsEmail') === undefined || config.get('vcsEmail') === '') { 
    config.update('vcsEmail', gitUserEmail() || '', vscode.ConfigurationTarget.Global);
  }
  if (config.get('vcsUid') === undefined || config.get('vcsUid') === '') { 
    config.update('vcsUid', gitUsername() || '', vscode.ConfigurationTarget.Global);
  }
}


