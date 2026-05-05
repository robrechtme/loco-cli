import {
  FlatTranslations,
  ImportResponse,
  ProjectLocale,
  PullOptions,
  PushOptions,
  Translations
} from '../../types';
import { HTTPError } from '../util/errors';

const BASE_URL = 'https://localise.biz/api';

const fetchApi = async <T>(
  apiKey: string,
  endpoint: string,
  searchParams = {},
  fetchOptions: RequestInit = {}
) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.search = new URLSearchParams(searchParams).toString();

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...(fetchOptions?.headers || {}),
      Authorization: `Loco ${apiKey}`
    }
  });
  if (!response.ok) {
    throw new HTTPError(response.status, response.statusText);
  }
  const json = (await response.json()) as T;
  return json;
};

export const apiPull = async (key: string, options: PullOptions = {}): Promise<Translations> => {
  const [translations, locales] = await Promise.all([
    fetchApi<Translations>(key, '/export/all.json', options),
    fetchApi<ProjectLocale[]>(key, '/locales')
  ]);

  // Loco's /export/all.json returns a locale-keyed object for multi-locale
  // projects but a flat asset map for single-locale projects. Decide based
  // on the response itself: if every top-level key matches a known locale
  // code, treat it as locale-keyed; otherwise wrap it under the project's
  // single locale code.
  const localeCodes = new Set(locales.map(l => l.code));
  const responseKeys = Object.keys(translations);
  const isLocaleKeyed = responseKeys.length > 0 && responseKeys.every(k => localeCodes.has(k));

  if (!isLocaleKeyed && locales.length === 1 && locales[0]) {
    return { [locales[0].code]: translations };
  }
  return translations;
};

export const apiPush = (
  key: string,
  locale: string,
  translations: FlatTranslations,
  options: PushOptions = {}
) =>
  fetchApi<ImportResponse>(
    key,
    '/import/json',
    {
      locale,
      ...Object.fromEntries(
        Object.entries(options)
          .filter(([k, v]) => v !== undefined && k !== 'experimentalPushAll')
          .map(([k, v]) => [k, String(v)])
      )
    },
    {
      method: 'POST',
      body: JSON.stringify(translations)
    }
  );

export const apiPushAll = (
  key: string,
  translations: Record<string, FlatTranslations>,
  options: PushOptions = {}
) =>
  fetchApi<ImportResponse>(
    key,
    '/import/json',
    {
      locale: 'auto',
      format: 'multi',
      ...Object.fromEntries(
        Object.entries(options)
          .filter(([k, v]) => v !== undefined && k !== 'experimentalPushAll')
          .map(([k, v]) => [k, String(v)])
      )
    },
    {
      method: 'POST',
      body: JSON.stringify(translations)
    }
  );
