import type { Command } from 'commander';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../src/util/options');
vi.mock('../../src/lib/readFiles');
vi.mock('../../src/lib/api');
vi.mock('../../src/util/logger');

import status from '../../src/commands/status';
import { apiPull } from '../../src/lib/api';
import { readFiles } from '../../src/lib/readFiles';
import { CliError } from '../../src/util/errors';
import { log } from '../../src/util/logger';
import { getGlobalOptions } from '../../src/util/options';

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

beforeEach(() => {
  vi.clearAllMocks();
  mockGetGlobalOptions.mockResolvedValue(defaultOptions);
  mockLog.log = vi.fn();
  mockLog.success = vi.fn();
  mockLog.error = vi.fn();
  mockLog.warn = vi.fn();
  mockLog.info = vi.fn();
});

describe('status command', () => {
  test('returns when no diff', async () => {
    const translations = { en: { hello: 'Hello' } };
    mockReadFiles.mockResolvedValue(translations);
    mockApiPull.mockResolvedValue(translations);

    await status({ direction: 'both' }, mockProgram);

    expect(mockLog.success).toHaveBeenCalledWith('Everything up to date!');
  });

  test('throws CliError when diff exists', async () => {
    const local = { en: { hello: 'Hello' } };
    const remote = { en: { hello: 'Hello', bye: 'Goodbye' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);

    await expect(status({ direction: 'both' }, mockProgram)).rejects.toThrow(CliError);
  });

  test('filters by direction=local shows only local changes', async () => {
    const local = { en: { hello: 'Hello', extra: 'Extra' } };
    const remote = { en: { hello: 'Hello', bye: 'Goodbye' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);

    await expect(status({ direction: 'local' }, mockProgram)).rejects.toThrow(CliError);

    expect(mockLog.log).toHaveBeenCalled();
  });

  test('filters by direction=remote shows only remote changes', async () => {
    const local = { en: { hello: 'Hello', extra: 'Extra' } };
    const remote = { en: { hello: 'Hello', bye: 'Goodbye' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);

    await expect(status({ direction: 'remote' }, mockProgram)).rejects.toThrow(CliError);

    expect(mockLog.log).toHaveBeenCalled();
  });

  test('shows all changes with direction=both', async () => {
    const local = { en: { hello: 'Hello', extra: 'Extra' } };
    const remote = { en: { hello: 'Changed', bye: 'Goodbye' } };
    mockReadFiles.mockResolvedValue(local);
    mockApiPull.mockResolvedValue(remote);

    await expect(status({ direction: 'both' }, mockProgram)).rejects.toThrow(CliError);

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

    await status({ direction: 'both' }, mockProgram);

    expect(mockApiPull).toHaveBeenCalledWith('test-key', { filter: 'mobile' });
  });
});
