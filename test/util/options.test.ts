import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';

vi.mock('../../src/util/config');
vi.mock('../../src/util/logger');

import { readConfig } from '../../src/util/config';
import { log } from '../../src/util/logger';
import { getGlobalOptions } from '../../src/util/options';

const mockReadConfig = vi.mocked(readConfig);
const mockLog = vi.mocked(log);

// Custom error to signal process.exit was called
class ExitError extends Error {
  constructor(public code: number) {
    super(`process.exit(${code})`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockExit: any;

const createMockProgram = (cliOptions: Record<string, unknown> = {}) => {
  return {
    parent: {
      opts: () => cliOptions
    }
  } as unknown as Command;
};

beforeEach(() => {
  vi.clearAllMocks();
  mockLog.log = vi.fn();
  mockLog.success = vi.fn();
  mockLog.error = vi.fn();
  mockLog.warn = vi.fn();
  mockLog.info = vi.fn();
  mockExit = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
    throw new ExitError(code ?? 0);
  }) as never);
});

afterEach(() => {
  mockExit.mockRestore();
});

describe('getGlobalOptions', () => {
  test('merges CLI options with config file', async () => {
    mockReadConfig.mockResolvedValue({
      accessKey: 'file-key',
      localesDir: './locales',
      namespaces: true
    });

    const result = await getGlobalOptions(createMockProgram({ maxFiles: 10 }));

    expect(result).toEqual({
      accessKey: 'file-key',
      localesDir: './locales',
      namespaces: true,
      maxFiles: 10
    });
  });

  test('file config overrides CLI options', async () => {
    // Note: The implementation actually does fileOptions spread AFTER cliOptions,
    // so file config takes precedence over CLI for shared keys
    mockReadConfig.mockResolvedValue({
      accessKey: 'file-key',
      localesDir: './from-file',
      namespaces: false
    });

    const result = await getGlobalOptions(createMockProgram({
      localesDir: './from-cli'
    }));

    expect(result.localesDir).toBe('./from-file');
  });

  test('exits when no accessKey', async () => {
    mockReadConfig.mockResolvedValue({});

    await expect(getGlobalOptions(createMockProgram({}))).rejects.toThrow(ExitError);

    expect(mockLog.error).toHaveBeenCalledWith(
      expect.stringContaining('No personal access token found')
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  test('accepts accessKey from CLI', async () => {
    mockReadConfig.mockResolvedValue({});

    const result = await getGlobalOptions(createMockProgram({
      accessKey: 'cli-key',
      localesDir: './locales',
      namespaces: false
    }));

    expect(result.accessKey).toBe('cli-key');
  });

  test('parses maxFiles as number', async () => {
    mockReadConfig.mockResolvedValue({
      accessKey: 'test-key',
      maxFiles: '50' as unknown as number // Test string-to-number parsing from config file
    });

    const result = await getGlobalOptions(createMockProgram({}));

    expect(result.maxFiles).toBe(50);
    expect(typeof result.maxFiles).toBe('number');
  });

  test('warns about deprecated defaultLanguage', async () => {
    mockReadConfig.mockResolvedValue({
      accessKey: 'test-key',
      defaultLanguage: 'en'
    });

    await getGlobalOptions(createMockProgram({}));

    expect(mockLog.warn).toHaveBeenCalledWith(
      expect.stringContaining('defaultLanguage')
    );
  });

  test('logs when reading from config file', async () => {
    mockReadConfig.mockResolvedValue({
      accessKey: 'test-key',
      localesDir: './locales'
    });

    await getGlobalOptions(createMockProgram({}));

    expect(mockLog.log).toHaveBeenCalledWith(expect.stringContaining('config file'));
  });

  test('does not log when no config file', async () => {
    mockReadConfig.mockResolvedValue({});

    await expect(getGlobalOptions(createMockProgram({}))).rejects.toThrow(ExitError);

    // Should not log about reading config file
    expect(mockLog.log).not.toHaveBeenCalledWith(expect.stringContaining('config file'));
  });

  test('exits when program has no parent', async () => {
    const programWithoutParent = {} as Command;

    await expect(getGlobalOptions(programWithoutParent)).rejects.toThrow(ExitError);

    expect(mockLog.error).toHaveBeenCalledWith('Something went wrong. Sorry!');
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
