import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';

vi.mock('../../src/util/options');
vi.mock('../../src/lib/readFiles');
vi.mock('../../src/lib/api');
vi.mock('../../src/util/logger');
vi.mock('inquirer');
vi.mock('cli-progress', () => ({
  default: {
    SingleBar: class {
      start = vi.fn();
      increment = vi.fn();
      stop = vi.fn();
    }
  }
}));

import { getGlobalOptions } from '../../src/util/options';
import { readFiles } from '../../src/lib/readFiles';
import { apiPull, apiPush, apiPushAll } from '../../src/lib/api';
import { log } from '../../src/util/logger';
import { CliError } from '../../src/util/errors';
import inquirer from 'inquirer';
import push from '../../src/commands/push';

const mockGetGlobalOptions = vi.mocked(getGlobalOptions);
const mockReadFiles = vi.mocked(readFiles);
const mockApiPull = vi.mocked(apiPull);
const mockApiPush = vi.mocked(apiPush);
const mockApiPushAll = vi.mocked(apiPushAll);
const mockLog = vi.mocked(log);
const mockInquirer = vi.mocked(inquirer);

const mockProgram = {} as Command;

const defaultOptions = {
  accessKey: 'test-key',
  localesDir: './locales',
  namespaces: false,
  maxFiles: 20
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetGlobalOptions.mockResolvedValue(defaultOptions);
  mockLog.log = vi.fn();
  mockLog.success = vi.fn();
  mockLog.error = vi.fn();
  mockLog.warn = vi.fn();
  mockLog.info = vi.fn();
  mockApiPush.mockResolvedValue({ status: 200, message: '1 translation imported', locales: [] });
  mockApiPushAll.mockResolvedValue({ status: 200, message: '1 translation imported', locales: [] });
});

describe('push command', () => {
  test('returns when no changes', async () => {
    const translations = { en: { hello: 'Hello' } };
    mockReadFiles.mockResolvedValue(translations);
    mockApiPull.mockResolvedValue(translations);

    await push({}, mockProgram);

    expect(mockLog.success).toHaveBeenCalledWith('Everything up to date!');
    expect(mockApiPush).not.toHaveBeenCalled();
  });

  test('shows deprecation warning for --status', async () => {
    const translations = { en: { hello: 'Hello' } };
    mockReadFiles.mockResolvedValue(translations);
    mockApiPull.mockResolvedValue(translations);

    await push({ status: 'fuzzy' }, mockProgram);

    expect(mockLog.warn).toHaveBeenCalledWith(
      expect.stringContaining('status option is removed')
    );
  });

  test('shows deprecation warning for --tag', async () => {
    const translations = { en: { hello: 'Hello' } };
    mockReadFiles.mockResolvedValue(translations);
    mockApiPull.mockResolvedValue(translations);

    await push({ tag: 'new' }, mockProgram);

    expect(mockLog.warn).toHaveBeenCalledWith(
      expect.stringContaining('tag option is removed')
    );
  });

  test('uploads each locale', async () => {
    const local = { en: { hello: 'Hello' }, es: { hello: 'Hola' } };
    const remote = { en: {}, es: {} };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: true });

    await push({}, mockProgram);

    expect(mockApiPush).toHaveBeenCalledTimes(2);
    expect(mockApiPush).toHaveBeenCalledWith('test-key', 'en', { hello: 'Hello' }, {});
    expect(mockApiPush).toHaveBeenCalledWith('test-key', 'es', { hello: 'Hola' }, {});
  });

  test('prompts for confirmation', async () => {
    const local = { en: { hello: 'Hello', bye: 'Goodbye' } };
    const remote = { en: { hello: 'Hello' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: true });

    await push({}, mockProgram);

    expect(mockInquirer.prompt).toHaveBeenCalled();
  });

  test('skips prompt with --yes flag', async () => {
    const local = { en: { hello: 'Hello', bye: 'Goodbye' } };
    const remote = { en: { hello: 'Hello' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);

    await push({ yes: true }, mockProgram);

    expect(mockInquirer.prompt).not.toHaveBeenCalled();
    expect(mockApiPush).toHaveBeenCalled();
  });

  test('shows warning when delete-absent is true', async () => {
    const local = { en: { hello: 'Hello' } };
    const remote = { en: { hello: 'Hello', bye: 'Goodbye' } };
    mockGetGlobalOptions.mockResolvedValue({
      ...defaultOptions,
      push: { 'delete-absent': true }
    });
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: false });

    await push({}, mockProgram);

    expect(mockLog.warn).toHaveBeenCalledWith(
      expect.stringContaining('delete-absent')
    );
  });

  test('does not push when only deletions exist and delete-absent is false', async () => {
    const local = { en: { hello: 'Hello' } };
    const remote = { en: { hello: 'Hello', bye: 'Goodbye', extra: 'Extra' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);

    await push({}, mockProgram);

    expect(mockLog.info).toHaveBeenCalledWith(
      expect.stringContaining('delete-absent')
    );
    expect(mockLog.success).toHaveBeenCalledWith('Everything up to date!');
    expect(mockApiPush).not.toHaveBeenCalled();
  });

  test('aborts on user decline', async () => {
    const local = { en: { hello: 'Hello', bye: 'Goodbye' } };
    const remote = { en: { hello: 'Hello' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: false });

    await push({}, mockProgram);

    expect(mockLog.error).toHaveBeenCalledWith('Nothing pushed');
    expect(mockApiPush).not.toHaveBeenCalled();
  });

  test('passes push options to API', async () => {
    const local = { en: { hello: 'Hello', bye: 'Goodbye' } };
    const remote = { en: { hello: 'Hello' } };
    mockGetGlobalOptions.mockResolvedValue({
      ...defaultOptions,
      push: { 'tag-new': 'from-code' }
    });
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: true });

    await push({}, mockProgram);

    expect(mockApiPush).toHaveBeenCalledWith(
      'test-key',
      'en',
      expect.any(Object),
      { 'tag-new': 'from-code' }
    );
  });

  test('uses apiPushAll when experimentalPushAll is enabled via CLI', async () => {
    const local = { en: { hello: 'Hello' }, es: { hello: 'Hola' } };
    const remote = { en: {}, es: {} };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: true });

    await push({ experimentalPushAll: true }, mockProgram);

    expect(mockApiPushAll).toHaveBeenCalledTimes(1);
    expect(mockApiPushAll).toHaveBeenCalledWith(
      'test-key',
      { en: { hello: 'Hello' }, es: { hello: 'Hola' } },
      { experimentalPushAll: true }
    );
    expect(mockApiPush).not.toHaveBeenCalled();
  });

  test('uses apiPushAll when experimentalPushAll is enabled via config', async () => {
    const local = { en: { hello: 'Hello' }, es: { hello: 'Hola' } };
    const remote = { en: {}, es: {} };
    mockGetGlobalOptions.mockResolvedValue({
      ...defaultOptions,
      push: { experimentalPushAll: true }
    });
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: true });

    await push({}, mockProgram);

    expect(mockApiPushAll).toHaveBeenCalledTimes(1);
    expect(mockApiPush).not.toHaveBeenCalled();
  });

  test('logs API response message per locale (per-locale path)', async () => {
    const local = { en: { hello: 'Hello' }, es: { hello: 'Hola' } };
    const remote = { en: {}, es: {} };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    mockApiPush
      .mockResolvedValueOnce({ status: 200, message: '1 new asset', locales: [] })
      .mockResolvedValueOnce({ status: 200, message: 'Nothing updated', locales: [] });
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: true });

    await push({}, mockProgram);

    expect(mockLog.log).toHaveBeenCalledWith(expect.stringContaining('en'));
    expect(mockLog.log).toHaveBeenCalledWith(expect.stringContaining('1 new asset'));
    expect(mockLog.log).toHaveBeenCalledWith(expect.stringContaining('es'));
    expect(mockLog.log).toHaveBeenCalledWith(expect.stringContaining('Nothing updated'));
  });

  test('logs API response message (experimentalPushAll path)', async () => {
    const local = { en: { hello: 'Hello' }, es: { hello: 'Hola' } };
    const remote = { en: {}, es: {} };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    mockApiPushAll.mockResolvedValue({
      status: 200,
      message: '4 translations imported, 2 new assets',
      locales: []
    });
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: true });

    await push({ experimentalPushAll: true }, mockProgram);

    expect(mockLog.log).toHaveBeenCalledWith('4 translations imported, 2 new assets');
  });

  test('throws CliError when all locales return "Nothing updated" (per-locale path)', async () => {
    const local = { en: { hello: 'Hello' }, es: { hello: 'Hola' } };
    const remote = { en: {}, es: {} };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    mockApiPush.mockResolvedValue({ status: 200, message: 'Nothing updated', locales: [] });
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: true });

    await expect(push({}, mockProgram)).rejects.toThrow(CliError);

    expect(mockLog.error).toHaveBeenCalledWith(
      expect.stringContaining('no changes despite a non-empty diff')
    );
    expect(mockLog.success).not.toHaveBeenCalledWith('All done.');
  });

  test('throws CliError when experimentalPushAll returns "Nothing updated"', async () => {
    const local = { en: { hello: 'Hello' }, es: { hello: 'Hola' } };
    const remote = { en: {}, es: {} };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    mockApiPushAll.mockResolvedValue({ status: 200, message: 'Nothing updated', locales: [] });
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: true });

    await expect(push({ experimentalPushAll: true }, mockProgram)).rejects.toThrow(CliError);

    expect(mockLog.error).toHaveBeenCalledWith(
      expect.stringContaining('no changes despite a non-empty diff')
    );
  });

  test('does not error when at least one locale reports changes', async () => {
    const local = { en: { hello: 'Hello' }, es: { hello: 'Hola' } };
    const remote = { en: {}, es: {} };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    mockApiPush
      .mockResolvedValueOnce({ status: 200, message: '1 new asset', locales: [] })
      .mockResolvedValueOnce({ status: 200, message: 'Nothing updated', locales: [] });
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: true });

    await push({}, mockProgram);

    expect(mockLog.success).toHaveBeenCalledWith('All done.');
  });

  test('uses default per-locale push when experimentalPushAll is false', async () => {
    const local = { en: { hello: 'Hello' }, es: { hello: 'Hola' } };
    const remote = { en: {}, es: {} };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: true });

    await push({}, mockProgram);

    expect(mockApiPush).toHaveBeenCalledTimes(2);
    expect(mockApiPushAll).not.toHaveBeenCalled();
  });
});
