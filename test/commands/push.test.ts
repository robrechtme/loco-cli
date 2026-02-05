import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';

vi.mock('../../src/util/options');
vi.mock('../../src/lib/readFiles');
vi.mock('../../src/lib/api');
vi.mock('../../src/util/logger');
vi.mock('inquirer');
vi.mock('cli-progress', () => ({
  default: {
    SingleBar: vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      increment: vi.fn(),
      stop: vi.fn()
    }))
  }
}));

import { getGlobalOptions } from '../../src/util/options';
import { readFiles } from '../../src/lib/readFiles';
import { apiPull, apiPush } from '../../src/lib/api';
import { log } from '../../src/util/logger';
import inquirer from 'inquirer';
import push from '../../src/commands/push';

const mockGetGlobalOptions = vi.mocked(getGlobalOptions);
const mockReadFiles = vi.mocked(readFiles);
const mockApiPull = vi.mocked(apiPull);
const mockApiPush = vi.mocked(apiPush);
const mockLog = vi.mocked(log);
const mockInquirer = vi.mocked(inquirer);

const mockProgram = {} as Command;

const defaultOptions = {
  accessKey: 'test-key',
  localesDir: './locales',
  namespaces: false,
  maxFiles: 20
};

// Custom error to signal process.exit was called
class ExitError extends Error {
  constructor(public code: number) {
    super(`process.exit(${code})`);
  }
}

let mockExit: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockGetGlobalOptions.mockResolvedValue(defaultOptions);
  mockLog.log = vi.fn();
  mockLog.success = vi.fn();
  mockLog.error = vi.fn();
  mockLog.warn = vi.fn();
  mockLog.info = vi.fn();
  mockApiPush.mockResolvedValue(undefined);
  mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new ExitError(code as number);
  });
});

afterEach(() => {
  mockExit.mockRestore();
});

describe('push command', () => {
  test('exits 0 when no changes', async () => {
    const translations = { en: { hello: 'Hello' } };
    mockReadFiles.mockResolvedValue(translations);
    mockApiPull.mockResolvedValue(translations);

    await expect(push({}, mockProgram)).rejects.toThrow(ExitError);

    expect(mockLog.success).toHaveBeenCalledWith('Everything up to date!');
    expect(mockExit).toHaveBeenCalledWith(0);
    expect(mockApiPush).not.toHaveBeenCalled();
  });

  test('shows deprecation warning for --status', async () => {
    const translations = { en: { hello: 'Hello' } };
    mockReadFiles.mockResolvedValue(translations);
    mockApiPull.mockResolvedValue(translations);

    await expect(push({ status: 'fuzzy' }, mockProgram)).rejects.toThrow(ExitError);

    expect(mockLog.warn).toHaveBeenCalledWith(
      expect.stringContaining('status option is removed')
    );
  });

  test('shows deprecation warning for --tag', async () => {
    const translations = { en: { hello: 'Hello' } };
    mockReadFiles.mockResolvedValue(translations);
    mockApiPull.mockResolvedValue(translations);

    await expect(push({ tag: 'new' }, mockProgram)).rejects.toThrow(ExitError);

    expect(mockLog.warn).toHaveBeenCalledWith(
      expect.stringContaining('tag option is removed')
    );
  });

  test('uploads each locale', async () => {
    const local = { en: { hello: 'Hello' }, es: { hello: 'Hola' } };
    const remote = { en: {}, es: {} };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    mockInquirer.prompt = vi.fn().mockResolvedValue({ confirm: true });

    await expect(push({}, mockProgram)).rejects.toThrow(ExitError);

    expect(mockApiPush).toHaveBeenCalledTimes(2);
    expect(mockApiPush).toHaveBeenCalledWith('test-key', 'en', { hello: 'Hello' }, undefined);
    expect(mockApiPush).toHaveBeenCalledWith('test-key', 'es', { hello: 'Hola' }, undefined);
  });

  test('prompts for confirmation', async () => {
    const local = { en: { hello: 'Hello', bye: 'Goodbye' } };
    const remote = { en: { hello: 'Hello' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    mockInquirer.prompt = vi.fn().mockResolvedValue({ confirm: true });

    await expect(push({}, mockProgram)).rejects.toThrow(ExitError);

    expect(mockInquirer.prompt).toHaveBeenCalled();
  });

  test('skips prompt with --yes flag', async () => {
    const local = { en: { hello: 'Hello', bye: 'Goodbye' } };
    const remote = { en: { hello: 'Hello' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);

    await expect(push({ yes: true }, mockProgram)).rejects.toThrow(ExitError);

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
    mockInquirer.prompt = vi.fn().mockResolvedValue({ confirm: false });

    await expect(push({}, mockProgram)).rejects.toThrow(ExitError);

    expect(mockLog.warn).toHaveBeenCalledWith(
      expect.stringContaining('delete-abscent')
    );
  });

  test('does not push when only deletions exist and delete-absent is false', async () => {
    const local = { en: { hello: 'Hello' } };
    const remote = { en: { hello: 'Hello', bye: 'Goodbye', extra: 'Extra' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);

    await expect(push({}, mockProgram)).rejects.toThrow(ExitError);

    expect(mockLog.info).toHaveBeenCalledWith(
      expect.stringContaining('delete-abscent')
    );
    expect(mockLog.success).toHaveBeenCalledWith('Everything up to date!');
    expect(mockApiPush).not.toHaveBeenCalled();
  });

  test('aborts on user decline', async () => {
    const local = { en: { hello: 'Hello', bye: 'Goodbye' } };
    const remote = { en: { hello: 'Hello' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    mockInquirer.prompt = vi.fn().mockResolvedValue({ confirm: false });

    await expect(push({}, mockProgram)).rejects.toThrow(ExitError);

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
    mockInquirer.prompt = vi.fn().mockResolvedValue({ confirm: true });

    await expect(push({}, mockProgram)).rejects.toThrow(ExitError);

    expect(mockApiPush).toHaveBeenCalledWith(
      'test-key',
      'en',
      expect.any(Object),
      { 'tag-new': 'from-code' }
    );
  });
});
