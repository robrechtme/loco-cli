import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';

vi.mock('../../src/util/options');
vi.mock('../../src/lib/readFiles');
vi.mock('../../src/lib/api');
vi.mock('../../src/lib/writeFiles');
vi.mock('../../src/util/logger');
vi.mock('inquirer');

import { getGlobalOptions } from '../../src/util/options';
import { readFiles } from '../../src/lib/readFiles';
import { apiPull } from '../../src/lib/api';
import { writeFiles } from '../../src/lib/writeFiles';
import { log } from '../../src/util/logger';
import inquirer from 'inquirer';
import pull from '../../src/commands/pull';

const mockGetGlobalOptions = vi.mocked(getGlobalOptions);
const mockReadFiles = vi.mocked(readFiles);
const mockApiPull = vi.mocked(apiPull);
const mockWriteFiles = vi.mocked(writeFiles);
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockExit: any;

beforeEach(() => {
  vi.clearAllMocks();
  mockGetGlobalOptions.mockResolvedValue(defaultOptions);
  mockLog.log = vi.fn();
  mockLog.success = vi.fn();
  mockLog.error = vi.fn();
  mockLog.warn = vi.fn();
  mockLog.info = vi.fn();
  // Make process.exit throw to stop execution
  mockExit = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
    throw new ExitError(code ?? 0);
  }) as never);
});

afterEach(() => {
  mockExit.mockRestore();
});

describe('pull command', () => {
  test('exits 0 when no changes', async () => {
    const translations = { en: { hello: 'Hello' } };
    mockReadFiles.mockResolvedValue(translations);
    mockApiPull.mockResolvedValue(translations);

    await expect(pull({}, mockProgram)).rejects.toThrow(ExitError);

    expect(mockLog.success).toHaveBeenCalledWith('Everything up to date!');
    expect(mockExit).toHaveBeenCalledWith(0);
    expect(mockWriteFiles).not.toHaveBeenCalled();
  });

  test('prompts for confirmation when changes exist', async () => {
    const local = { en: { hello: 'Hello' } };
    const remote = { en: { hello: 'Hello', bye: 'Goodbye' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: true });

    await expect(pull({}, mockProgram)).rejects.toThrow(ExitError);

    expect(mockInquirer.prompt).toHaveBeenCalled();
  });

  test('writes files after confirmation', async () => {
    const local = { en: { hello: 'Hello' } };
    const remote = { en: { hello: 'Hello', bye: 'Goodbye' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: true });

    await expect(pull({}, mockProgram)).rejects.toThrow(ExitError);

    expect(mockWriteFiles).toHaveBeenCalledWith(remote, defaultOptions);
    expect(mockLog.success).toHaveBeenCalledWith(expect.stringContaining('Wrote files'));
  });

  test('skips write on decline', async () => {
    const local = { en: { hello: 'Hello' } };
    const remote = { en: { hello: 'Hello', bye: 'Goodbye' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: false });

    await expect(pull({}, mockProgram)).rejects.toThrow(ExitError);

    expect(mockWriteFiles).not.toHaveBeenCalled();
    expect(mockLog.error).toHaveBeenCalledWith('Nothing pulled');
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  test('skips prompt with --yes flag', async () => {
    const local = { en: { hello: 'Hello' } };
    const remote = { en: { hello: 'Hello', bye: 'Goodbye' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);

    await expect(pull({ yes: true }, mockProgram)).rejects.toThrow(ExitError);

    expect(mockInquirer.prompt).not.toHaveBeenCalled();
    expect(mockWriteFiles).toHaveBeenCalledWith(remote, defaultOptions);
  });

  test('handles API error', async () => {
    mockReadFiles.mockResolvedValue({ en: { hello: 'Hello' } });
    mockApiPull.mockRejectedValue(new Error('HTTPError: 401 Unauthorized'));

    await expect(pull({}, mockProgram)).rejects.toThrow('HTTPError: 401 Unauthorized');
  });

  test('displays diff summary', async () => {
    const local = { en: { hello: 'Hello' } };
    const remote = { en: { hello: 'Changed', bye: 'Goodbye' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);
    vi.mocked(mockInquirer.prompt).mockResolvedValue({ confirm: false });

    await expect(pull({}, mockProgram)).rejects.toThrow(ExitError);

    expect(mockLog.log).toHaveBeenCalledWith(expect.stringContaining('Pulling will have the following effect'));
  });
});
