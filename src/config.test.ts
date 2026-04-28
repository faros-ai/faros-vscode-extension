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

  test('migrates legacy config file to protected storage and keeps the shared installer file', async () => {
    const legacyConfigDir = path.join(process.env.HOME || '', '.vscode', 'extensions', 'farosai');
    const legacyConfigFile = path.join(legacyConfigDir, '.config.json');
    const protectedConfigFile = path.join(tmpRoot, 'global-storage', '.config.json');
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
    assert.strictEqual(fs.existsSync(legacyConfigFile), true);
    assert.strictEqual(fs.existsSync(protectedConfigFile), true);
  });

  test('uses a rerun installer payload to rotate protected webhook credentials', async () => {
    const legacyConfigDir = path.join(process.env.HOME || '', '.vscode', 'extensions', 'farosai');
    const legacyConfigFile = path.join(legacyConfigDir, '.config.json');
    const protectedConfigDir = path.join(tmpRoot, 'global-storage');
    const protectedConfigFile = path.join(protectedConfigDir, '.config.json');
    fs.mkdirSync(legacyConfigDir, {recursive: true});
    fs.mkdirSync(protectedConfigDir, {recursive: true});
    fs.writeFileSync(
      protectedConfigFile,
      JSON.stringify({
        webhook: 'https://example.com/old-webhook',
        webhookSecret: 'old-secret',
      })
    );
    fs.writeFileSync(
      legacyConfigFile,
      JSON.stringify({
        webhook: 'https://example.com/new-webhook',
        webhookSecret: 'new-secret',
      })
    );

    await updateConfig();

    assert.strictEqual(farosConfig.webhook(), 'https://example.com/new-webhook');
    assert.strictEqual(farosConfig.webhookSecret(), 'new-secret');
    const protectedValues = JSON.parse(fs.readFileSync(protectedConfigFile, 'utf8'));
    assert.strictEqual(protectedValues.webhook, 'https://example.com/new-webhook');
    assert.strictEqual(protectedValues.webhookSecret, 'new-secret');
  });

  test('does not let an incomplete legacy webhook overwrite signed protected credentials', async () => {
    const legacyConfigDir = path.join(process.env.HOME || '', '.vscode', 'extensions', 'farosai');
    const legacyConfigFile = path.join(legacyConfigDir, '.config.json');
    const protectedConfigDir = path.join(tmpRoot, 'global-storage');
    const protectedConfigFile = path.join(protectedConfigDir, '.config.json');
    fs.mkdirSync(legacyConfigDir, {recursive: true});
    fs.mkdirSync(protectedConfigDir, {recursive: true});
    fs.writeFileSync(
      protectedConfigFile,
      JSON.stringify({
        webhook: 'https://example.com/protected-webhook',
        webhookSecret: 'protected-secret',
      })
    );
    fs.writeFileSync(
      legacyConfigFile,
      JSON.stringify({
        webhook: 'https://example.com/legacy-webhook',
      })
    );

    await updateConfig();

    assert.strictEqual(farosConfig.webhook(), 'https://example.com/protected-webhook');
    assert.strictEqual(farosConfig.webhookSecret(), 'protected-secret');
  });
});
