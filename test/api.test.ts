import { describe, test, expect, vi, beforeEach } from 'vitest';
import {
  mockTranslations,
  mockSingleLocaleTranslations,
  mockMultipleLocales,
  mockSingleLocale,
  createMockResponse,
  createMockErrorResponse
} from './mockdata/mockApi';
import { apiPull, apiPush, apiPushAll } from '../src/lib/api';
import { HTTPError } from '../src/util/errors';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('apiPull', () => {
  test('fetches /export/all.json with auth header', async () => {
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockTranslations) as Response)
      .mockResolvedValueOnce(createMockResponse(mockMultipleLocales) as Response);

    await apiPull('test-api-key');

    expect(mockFetch).toHaveBeenCalledTimes(2);

    const exportCall = mockFetch.mock.calls[0]!;
    const exportUrl = exportCall[0] as URL;
    expect(exportUrl.pathname).toBe('/api/export/all.json');

    const exportOptions = exportCall[1] as RequestInit;
    expect(exportOptions.headers).toEqual({ Authorization: 'Loco test-api-key' });
  });

  test('returns translations as-is for multi-locale projects', async () => {
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockTranslations) as Response)
      .mockResolvedValueOnce(createMockResponse(mockMultipleLocales) as Response);

    const result = await apiPull('test-api-key');

    expect(result).toEqual(mockTranslations);
  });

  test('wraps single-locale response in object', async () => {
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockSingleLocaleTranslations) as Response)
      .mockResolvedValueOnce(createMockResponse(mockSingleLocale) as Response);

    const result = await apiPull('test-api-key');

    expect(result).toEqual({ en: mockSingleLocaleTranslations });
  });

  test('passes filter options as query params', async () => {
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockTranslations) as Response)
      .mockResolvedValueOnce(createMockResponse(mockMultipleLocales) as Response);

    await apiPull('test-api-key', { filter: 'mobile', fallback: 'en' });

    const exportCall = mockFetch.mock.calls[0]!;
    const exportUrl = exportCall[0] as URL;
    expect(exportUrl.searchParams.get('filter')).toBe('mobile');
    expect(exportUrl.searchParams.get('fallback')).toBe('en');
  });

  test('throws HTTPError on 401 Unauthorized', async () => {
    mockFetch.mockResolvedValueOnce(createMockErrorResponse(401, 'Unauthorized') as Response);

    const error = await apiPull('invalid-key').catch(e => e);
    expect(error).toBeInstanceOf(HTTPError);
    expect(error.status).toBe(401);
    expect(error.statusText).toBe('Unauthorized');
    expect(error.message).toBe('HTTPError: 401 Unauthorized');
  });

  test('throws HTTPError on 500 Server Error', async () => {
    mockFetch.mockResolvedValueOnce(createMockErrorResponse(500, 'Internal Server Error') as Response);

    const error = await apiPull('test-api-key').catch(e => e);
    expect(error).toBeInstanceOf(HTTPError);
    expect(error.status).toBe(500);
  });
});

describe('apiPush', () => {
  test('sends POST to /import/json', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({}) as Response);

    await apiPush('test-api-key', 'en', { 'common.hello': 'Hello' });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    const call = mockFetch.mock.calls[0]!;
    const url = call[0] as URL;
    expect(url.pathname).toBe('/api/import/json');

    const options = call[1] as RequestInit;
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({ Authorization: 'Loco test-api-key' });
  });

  test('includes locale in query params', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({}) as Response);

    await apiPush('test-api-key', 'es', { 'common.hello': 'Hola' });

    const call = mockFetch.mock.calls[0]!;
    const url = call[0] as URL;
    expect(url.searchParams.get('locale')).toBe('es');
  });

  test('converts boolean options to strings', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({}) as Response);

    await apiPush('test-api-key', 'en', { 'common.hello': 'Hello' }, { 'delete-absent': true });

    const call = mockFetch.mock.calls[0]!;
    const url = call[0] as URL;
    expect(url.searchParams.get('delete-absent')).toBe('true');
  });

  test('sends JSON body', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({}) as Response);

    const translations = { 'common.hello': 'Hello', 'common.bye': 'Goodbye' };
    await apiPush('test-api-key', 'en', translations);

    const call = mockFetch.mock.calls[0]!;
    const options = call[1] as RequestInit;
    expect(options.body).toBe(JSON.stringify(translations));
  });

  test('throws HTTPError on non-2xx response', async () => {
    mockFetch.mockResolvedValueOnce(createMockErrorResponse(403, 'Forbidden') as Response);

    const error = await apiPush('test-api-key', 'en', {}).catch(e => e);
    expect(error).toBeInstanceOf(HTTPError);
    expect(error.status).toBe(403);
  });

  test('excludes experimentalPushAll from query params', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({}) as Response);

    await apiPush('test-api-key', 'en', { 'common.hello': 'Hello' }, { experimentalPushAll: true });

    const call = mockFetch.mock.calls[0]!;
    const url = call[0] as URL;
    expect(url.searchParams.has('experimentalPushAll')).toBe(false);
  });
});

describe('apiPushAll', () => {
  test('sends POST to /import/json with locale=auto and format=multi', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({}) as Response);

    await apiPushAll('test-api-key', { en: { 'common.hello': 'Hello' } });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    const call = mockFetch.mock.calls[0]!;
    const url = call[0] as URL;
    expect(url.pathname).toBe('/api/import/json');
    expect(url.searchParams.get('locale')).toBe('auto');
    expect(url.searchParams.get('format')).toBe('multi');

    const options = call[1] as RequestInit;
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({ Authorization: 'Loco test-api-key' });
  });

  test('sends multi-locale JSON body', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({}) as Response);

    const translations = {
      en: { 'common.hello': 'Hello', 'common.bye': 'Goodbye' },
      es: { 'common.hello': 'Hola', 'common.bye': 'Adiós' }
    };
    await apiPushAll('test-api-key', translations);

    const call = mockFetch.mock.calls[0]!;
    const options = call[1] as RequestInit;
    expect(options.body).toBe(JSON.stringify(translations));
  });

  test('converts boolean options to strings', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({}) as Response);

    await apiPushAll('test-api-key', { en: {} }, { 'delete-absent': true });

    const call = mockFetch.mock.calls[0]!;
    const url = call[0] as URL;
    expect(url.searchParams.get('delete-absent')).toBe('true');
  });

  test('excludes experimentalPushAll from query params', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({}) as Response);

    await apiPushAll('test-api-key', { en: {} }, { experimentalPushAll: true });

    const call = mockFetch.mock.calls[0]!;
    const url = call[0] as URL;
    expect(url.searchParams.has('experimentalPushAll')).toBe(false);
  });

  test('throws HTTPError on non-2xx response', async () => {
    mockFetch.mockResolvedValueOnce(createMockErrorResponse(403, 'Forbidden') as Response);

    const error = await apiPushAll('test-api-key', {}).catch(e => e);
    expect(error).toBeInstanceOf(HTTPError);
    expect(error.status).toBe(403);
  });
});
