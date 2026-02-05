import { describe, test, expect, vi, beforeEach } from 'vitest';
import { join } from 'path';

vi.mock('fs', () => ({
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn()
}));

import { mkdirSync, writeFileSync } from 'fs';
import { writeFiles } from '../src/lib/writeFiles';

const mockMkdirSync = vi.mocked(mkdirSync);
const mockWriteFileSync = vi.mocked(writeFileSync);

beforeEach(() => {
  mockMkdirSync.mockReset();
  mockWriteFileSync.mockReset();
});

describe('writeFiles', () => {
  const translations = {
    en: { 'common:hello': 'Hello', 'common:bye': 'Goodbye' },
    es: { 'common:hello': 'Hola', 'common:bye': 'Adiós' }
  };

  test('creates localesDir with recursive flag', () => {
    writeFiles(translations, { localesDir: './locales', namespaces: false, accessKey: '' });

    expect(mockMkdirSync).toHaveBeenCalledWith('./locales', { recursive: true });
  });

  test('writes flat files without namespaces', () => {
    writeFiles(translations, { localesDir: './locales', namespaces: false, accessKey: '' });

    expect(mockWriteFileSync).toHaveBeenCalledTimes(2);
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      join('./locales', 'en.json'),
      expect.any(String)
    );
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      join('./locales', 'es.json'),
      expect.any(String)
    );
  });

  test('writes namespaced files', () => {
    writeFiles(translations, { localesDir: './locales', namespaces: true, accessKey: '' });

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      join('./locales', 'en', 'common.json'),
      expect.any(String)
    );
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      join('./locales', 'es', 'common.json'),
      expect.any(String)
    );
  });

  test('creates language subdirs for namespaces', () => {
    writeFiles(translations, { localesDir: './locales', namespaces: true, accessKey: '' });

    expect(mockMkdirSync).toHaveBeenCalledWith(join('./locales', 'en'), { recursive: true });
    expect(mockMkdirSync).toHaveBeenCalledWith(join('./locales', 'es'), { recursive: true });
  });

  test('formats JSON with 2-space indent', () => {
    const singleTranslation = { en: { hello: 'Hello' } };
    writeFiles(singleTranslation, { localesDir: './locales', namespaces: false, accessKey: '' });

    const [, content] = mockWriteFileSync.mock.calls[0];
    expect(content).toBe(JSON.stringify({ hello: 'Hello' }, null, 2));
  });

  test('handles empty translations', () => {
    writeFiles({}, { localesDir: './locales', namespaces: false, accessKey: '' });

    expect(mockMkdirSync).toHaveBeenCalledWith('./locales', { recursive: true });
    expect(mockWriteFileSync).not.toHaveBeenCalled();
  });
});
