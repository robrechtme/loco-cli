import { describe, test, expect, vi, beforeEach } from 'vitest';

vi.mock('cosmiconfig', () => ({
  cosmiconfig: vi.fn(() => ({
    search: vi.fn()
  }))
}));

import { cosmiconfig } from 'cosmiconfig';

const mockCosmiconfig = vi.mocked(cosmiconfig);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('readConfig', () => {
  test('returns config from cosmiconfig', async () => {
    const mockConfig = {
      accessKey: 'test-key',
      localesDir: './locales',
      namespaces: true
    };
    mockCosmiconfig.mockReturnValue({
      search: vi.fn().mockResolvedValue({ config: mockConfig }),
      load: vi.fn(),
      clearCaches: vi.fn(),
      clearLoadCache: vi.fn(),
      clearSearchCache: vi.fn()
    });

    // Re-import to get fresh module with new mock
    vi.resetModules();
    const { readConfig: freshReadConfig } = await import('../../src/util/config');

    const result = await freshReadConfig();

    expect(result).toEqual(mockConfig);
  });

  test('returns empty object when no config found', async () => {
    mockCosmiconfig.mockReturnValue({
      search: vi.fn().mockResolvedValue(null),
      load: vi.fn(),
      clearCaches: vi.fn(),
      clearLoadCache: vi.fn(),
      clearSearchCache: vi.fn()
    });

    vi.resetModules();
    const { readConfig: freshReadConfig } = await import('../../src/util/config');

    const result = await freshReadConfig();

    expect(result).toEqual({});
  });

  test('uses loco as config name', async () => {
    mockCosmiconfig.mockReturnValue({
      search: vi.fn().mockResolvedValue(null),
      load: vi.fn(),
      clearCaches: vi.fn(),
      clearLoadCache: vi.fn(),
      clearSearchCache: vi.fn()
    });

    vi.resetModules();
    await import('../../src/util/config');

    expect(mockCosmiconfig).toHaveBeenCalledWith('loco');
  });
});
