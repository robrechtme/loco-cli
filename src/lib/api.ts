import fetch from 'isomorphic-unfetch';
import {
  FlatTranslations,
  ProjectLocale,
  PullOptions,
  PushOptions,
  Translations
} from '../../types';

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
    throw new Error(`HTTPError: ${response.status} ${response.statusText}`);
  }
  const json = (await response.json()) as T;
  return json;
};

export const apiPull = async (key: string, options: PullOptions = {}) => {
  const translations = await fetchApi<Translations>(key, '/export/all.json', options);
  const locales = await fetchApi<ProjectLocale[]>(key, '/locales');
  const firstLocale = locales[0];
  if (locales.length === 1 && firstLocale) {
    return { [firstLocale.code]: translations };
  }
  return translations;
};

export const apiPush = (
  key: string,
  locale: string,
  translations: FlatTranslations,
  options: PushOptions = {}
) =>
  fetchApi<void>(
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
  fetchApi<void>(
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
