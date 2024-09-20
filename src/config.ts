import * as vscode from "vscode";

const config = vscode.workspace.getConfiguration('faros');

import * as fs from 'fs';
import * as path from 'path';
import gitUserName from "git-user-name";
import gitUserEmail from "git-user-email";

interface FarosConfig {
  apiKey: string;
  vcsUid: string;
  url: string;
  graph: string;
  origin: string;
  batchSize: number;
  batchInterval: number;
}

export function loadConfig(): FarosConfig {
  const defaultConfig: FarosConfig = {
    apiKey: config.get('apiKey') || '',
    vcsUid: config.get('vcsUid') || gitUserName() || gitUserEmail() || '',
    url: config.get('url') || 'https://prod.api.faros.ai',
    graph: config.get('graph') || 'default',
    origin: config.get('origin') || 'faros-vscode-extension',
    batchSize: config.get('batchSize') || 500,
    batchInterval: config.get('batchInterval') || 60000,
  };

  const configPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.vscode', 'extensions', 'faros', '.config.json');

  if (fs.existsSync(configPath)) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return { ...defaultConfig, ...fileConfig };
    } catch (error) {
      console.error('Error reading .faros-config.json:', error);
    }
  }

  return defaultConfig;
}

export const farosConfig = loadConfig();

export function updateConfig(newConfig: Partial<FarosConfig> = farosConfig): void {
  Object.entries(newConfig).forEach(([key, value]) => {
    config.update(key, value, vscode.ConfigurationTarget.Global);
  });
}


