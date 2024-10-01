import * as vscode from "vscode";

const config = vscode.workspace.getConfiguration('faros');

import * as fs from 'fs';
import * as path from 'path';
import { createHash, randomUUID } from "crypto";
import { getGitUserEmail, getGitUserName } from "./git";

export interface FarosConfig {
  apiKey: () => string;
  vcsUid: (update?: boolean) => string;
  vcsEmail: () => string;
  vcsName: () => string;
  url: () => string;
  graph: () => string;
  origin: () => string;
  batchSize: () => number;
  batchInterval: () => number;
  webhook: () => string;
}

export const farosConfig: FarosConfig = {
  apiKey: () => config.get('apiKey') || '',
  vcsUid: (update = true) => {
    if (config.get('vcsUid') === undefined || config.get('vcsUid') === '') {
      if (update) {
        updateConfig();
      }
    }
    return config.get('vcsUid') || '';
  },
  vcsEmail: () => config.get('vcsEmail') || '',
  vcsName: () => config.get('vcsName') || '',
  url: () => config.get('url') || 'https://prod.api.faros.ai',
  graph: () => config.get('graph') || 'default',
  origin: () => config.get('origin') || 'faros-vscode-extension',
  batchSize: () => config.get('batchSize') || 500,
  batchInterval: () => Number(config.get('batchInterval')) || 60000,
  webhook: () => config.get('webhook') || '',
};

export function updateConfig(): void {
  const configPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.vscode', 'extensions', 'farosai', '.config.json');

  if (fs.existsSync(configPath)) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      Object.entries(fileConfig).forEach(([key, value]) => {
        console.log('Updating config:', key, value);
        config.update(key, value, vscode.ConfigurationTarget.Global);
      });
    } catch (error) {
      console.error('Error reading .faros-config.json:', error);
    }
  }
  if (farosConfig.vcsName() === '') {
    config.update('vcsName', getGitUserName() || '', vscode.ConfigurationTarget.Global);
  }
  if (farosConfig.vcsEmail() === '') {
    config.update('vcsEmail', getGitUserEmail() || '', vscode.ConfigurationTarget.Global);
  }
  if (farosConfig.vcsUid(false) === '') {
    const hash = createHash('sha256');
    hash.update(farosConfig.vcsName() || farosConfig.vcsEmail() || randomUUID());
    const vcsUid = hash.digest('hex').substring(0, 8) || randomUUID();
    config.update('vcsUid', vcsUid, vscode.ConfigurationTarget.Global);
  }
}