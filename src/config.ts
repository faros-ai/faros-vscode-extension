import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';
import { createHash, randomUUID } from "crypto";
import { getGitUserEmail, getGitUserName } from "./git";

const config = vscode.workspace.getConfiguration('faros');
const CONFIG_FILE_KEYS = new Set(['webhook', 'webhookSecret']);
let protectedConfigPath: string | undefined;

function legacyConfigPath(): string {
  return path.join(
    process.env.HOME || process.env.USERPROFILE || '',
    '.vscode',
    'extensions',
    'farosai',
    '.config.json'
  );
}

export function setProtectedConfigStorageUri(storageUri: vscode.Uri): void {
  protectedConfigPath = path.join(storageUri.fsPath, '.config.json');
}

function configPath(): string {
  return protectedConfigPath ?? legacyConfigPath();
}

function configPaths(): string[] {
  return Array.from(
    new Set(
      protectedConfigPath
        ? [protectedConfigPath, legacyConfigPath()]
        : [legacyConfigPath()]
    )
  );
}

function readConfigFile(filepath: string): Record<string, unknown> {
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

function fileConfig(): Record<string, unknown> {
  for (const filepath of configPaths()) {
    const values = readConfigFile(filepath);
    if (Object.keys(values).length > 0) {
      return values;
    }
  }
  return {};
}

function configValue(key: string): string {
  const value = fileConfig()[key];
  if (typeof value === 'string' && value) {
    return value;
  }
  if (CONFIG_FILE_KEYS.has(key)) {
    return '';
  }
  const configured = config.get<string>(key);
  return configured || '';
}

function writeProtectedConfig(values: Record<string, unknown>): void {
  const filepath = configPath();
  const dir = path.dirname(filepath);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  fs.chmodSync(dir, 0o700);
  fs.writeFileSync(filepath, JSON.stringify(values, null, 2), { mode: 0o600 });
  fs.chmodSync(filepath, 0o600);
}

function migrateProtectedConfigKeys(): void {
  const values = fileConfig();
  const updatedValues = { ...values };
  let shouldWrite = false;
  const shouldPromoteLegacyConfig = Boolean(
    protectedConfigPath &&
      !fs.existsSync(protectedConfigPath) &&
      Object.keys(updatedValues).length > 0
  );

  for (const key of CONFIG_FILE_KEYS) {
    if (typeof updatedValues[key] === 'string' && updatedValues[key]) {
      continue;
    }
    const configured = config.get<string>(key);
    if (configured) {
      updatedValues[key] = configured;
      shouldWrite = true;
    }
  }

  if (shouldWrite || shouldPromoteLegacyConfig) {
    try {
      writeProtectedConfig(updatedValues);
    } catch (error) {
      console.error('Error migrating Faros protected config:', error);
    }
  }
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
        void updateConfig().catch((error) => {
          console.error('Error updating Faros config:', error);
        });
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
  migrateProtectedConfigKeys();
  const values = fileConfig();
  if (Object.keys(values).length > 0) {
    for (const [key, value] of Object.entries(values)) {
      if (CONFIG_FILE_KEYS.has(key)) {
        continue;
      }
      console.log('Updating config:', key);
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
