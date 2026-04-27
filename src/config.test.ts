import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { farosConfig, setProtectedConfigStorageUri, updateConfig } from './config';

suite('Faros Config Migration Test', () => {
  let originalHome: string | undefined;
  let tmpRoot: string;

  setup(async () => {
    originalHome = process.env.HOME;
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'faros-config-test-'));
    process.env.HOME = path.join(tmpRoot, 'home');
    setProtectedConfigStorageUri(vscode.Uri.file(path.join(tmpRoot, 'global-storage')));
  });

  teardown(async () => {
    process.env.HOME = originalHome;
    fs.rmSync(tmpRoot, {recursive: true, force: true});
  });

  test('migrates legacy config file to protected storage and removes the legacy file', async () => {
    const legacyConfigDir = path.join(process.env.HOME || '', '.vscode', 'extensions', 'farosai');
    const legacyConfigFile = path.join(legacyConfigDir, '.config.json');
    fs.mkdirSync(legacyConfigDir, {recursive: true});
    fs.writeFileSync(
      legacyConfigFile,
      JSON.stringify({
        webhook: 'https://example.com/webhook',
        webhookSecret: 'test-secret',
      })
    );

    await updateConfig();

    assert.strictEqual(farosConfig.webhook(), 'https://example.com/webhook');
    assert.strictEqual(farosConfig.webhookSecret(), 'test-secret');
    assert.strictEqual(fs.existsSync(legacyConfigFile), false);
  });
});
