import fetch from "isomorphic-unfetch";
import {
  ProjectLocale,
  PullOptions,
  PushOptions,
  Translations,
} from "../../types";

const BASE_URL = "https://localise.biz/api";

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
      Authorization: `Loco ${apiKey}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTPError: ${response.status} ${response.statusText}`);
  }
  const json = (await response.json()) as T;
  return json;
};

export const apiPull = async (key: string, options: PullOptions = {}) => {
  const translations = await fetchApi<Translations>(
    key,
    "/export/all.json",
    options
  );
  const locales = await fetchApi<ProjectLocale[]>(key, "/locales");
  if (locales?.length === 1) {
    return { [locales[0].code]: translations };
  }
  return translations;
};

export const apiPush = (
  key: string,
  locale: string,
  translations: Translations[string],
  options: PushOptions = {}
) =>
  fetchApi<void>(
    key,
    "/import/json",
    {
      locale,
      ...Object.keys(options).reduce(
        (acc, key) => ({
          ...acc,
          [key]: options[key as keyof PushOptions]?.toString(),
        }),
        {}
      ),
    },
    {
      method: "POST",
      body: JSON.stringify(translations),
    }
  );
