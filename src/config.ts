import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';
import { createHash, randomUUID } from "crypto";
import { getGitUserEmail, getGitUserName } from "./git";

const config = vscode.workspace.getConfiguration('faros');
const CONFIG_FILE_KEYS = new Set(['webhook', 'webhookSecret']);

function configPath(): string {
  return path.join(
    process.env.HOME || process.env.USERPROFILE || '',
    '.vscode',
    'extensions',
    'farosai',
    '.config.json'
  );
}

function fileConfig(): Record<string, unknown> {
  const filepath = configPath();
  if (!fs.existsSync(filepath)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (error) {
    console.error('Error reading Faros config file:', error);
    return {};
  }
}

function configValue(key: string): string {
  const value = fileConfig()[key];
  if (typeof value === 'string' && value) {
    return value;
  }
  const configured = config.get<string>(key);
  return configured || '';
}

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
  webhookSecret: () => string;
  autoCompletionCategory: () => string;
  handWrittenCategory: () => string;
  userSource: () => string;
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
  webhook: () => configValue('webhook'),
  webhookSecret: () => configValue('webhookSecret'),
  autoCompletionCategory: () => config.get('autoCompletionCategory') || 'AutoCompletion',
  handWrittenCategory: () => config.get('handWrittenCategory') || 'HandWritten',
  userSource: () => config.get('userSource') || 'vscode-extension',
};

export async function updateConfig(): Promise<void> {
  const values = fileConfig();
  if (Object.keys(values).length > 0) {
    for (const [key, value] of Object.entries(values)) {
      if (CONFIG_FILE_KEYS.has(key)) {
        continue;
      }
      console.log('Updating config:', key, value);
      await config.update(key, value, vscode.ConfigurationTarget.Global);
    }
  }
  if (farosConfig.vcsName() === '') {
    await config.update('vcsName', getGitUserName() || '', vscode.ConfigurationTarget.Global);
  }
  if (farosConfig.vcsEmail() === '') {
    await config.update('vcsEmail', getGitUserEmail() || '', vscode.ConfigurationTarget.Global);
  }
  if (farosConfig.vcsUid(false) === '') {
    const hash = createHash('sha256');
    hash.update(farosConfig.vcsName() || farosConfig.vcsEmail() || randomUUID());
    const vcsUid = hash.digest('hex').substring(0, 8) || randomUUID();
    await config.update('vcsUid', vcsUid, vscode.ConfigurationTarget.Global);
  }
}
