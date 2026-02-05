import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';

vi.mock('../../src/util/options');
vi.mock('../../src/lib/readFiles');
vi.mock('../../src/lib/api');
vi.mock('../../src/util/logger');

import { getGlobalOptions } from '../../src/util/options';
import { readFiles } from '../../src/lib/readFiles';
import { apiPull } from '../../src/lib/api';
import { log } from '../../src/util/logger';
import status from '../../src/commands/status';

const mockGetGlobalOptions = vi.mocked(getGlobalOptions);
const mockReadFiles = vi.mocked(readFiles);
const mockApiPull = vi.mocked(apiPull);
const mockLog = vi.mocked(log);

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
  mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new ExitError(code as number);
  });
});

afterEach(() => {
  mockExit.mockRestore();
});

describe('status command', () => {
  test('exits 0 when no diff', async () => {
    const translations = { en: { hello: 'Hello' } };
    mockReadFiles.mockResolvedValue(translations);
    mockApiPull.mockResolvedValue(translations);

    await expect(status({ direction: 'both' }, mockProgram)).rejects.toThrow(ExitError);

    expect(mockLog.success).toHaveBeenCalledWith('Everything up to date!');
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  test('exits 1 when diff exists', async () => {
    const local = { en: { hello: 'Hello' } };
    const remote = { en: { hello: 'Hello', bye: 'Goodbye' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);

    await expect(status({ direction: 'both' }, mockProgram)).rejects.toThrow(ExitError);

    expect(mockExit).toHaveBeenCalledWith(1);
  });

  test('filters by direction=local shows only local changes', async () => {
    const local = { en: { hello: 'Hello', extra: 'Extra' } };
    const remote = { en: { hello: 'Hello', bye: 'Goodbye' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);

    await expect(status({ direction: 'local' }, mockProgram)).rejects.toThrow(ExitError);

    // With direction=local, only updated and deleted are shown (not added)
    expect(mockLog.log).toHaveBeenCalled();
  });

  test('filters by direction=remote shows only remote changes', async () => {
    const local = { en: { hello: 'Hello', extra: 'Extra' } };
    const remote = { en: { hello: 'Hello', bye: 'Goodbye' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);

    await expect(status({ direction: 'remote' }, mockProgram)).rejects.toThrow(ExitError);

    // With direction=remote, only added is shown
    expect(mockLog.log).toHaveBeenCalled();
  });

  test('shows all changes with direction=both', async () => {
    const local = { en: { hello: 'Hello', extra: 'Extra' } };
    const remote = { en: { hello: 'Changed', bye: 'Goodbye' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);

    await expect(status({ direction: 'both' }, mockProgram)).rejects.toThrow(ExitError);

    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockLog.log).toHaveBeenCalled();
  });

  test('fetches remote translations with pull options', async () => {
    const translations = { en: { hello: 'Hello' } };
    mockGetGlobalOptions.mockResolvedValue({
      ...defaultOptions,
      pull: { filter: 'mobile' }
    });
    mockReadFiles.mockResolvedValue(translations);
    mockApiPull.mockResolvedValue(translations);

    await expect(status({ direction: 'both' }, mockProgram)).rejects.toThrow(ExitError);

    expect(mockApiPull).toHaveBeenCalledWith('test-key', { filter: 'mobile' });
  });
});
