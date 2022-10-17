import fetch from "isomorphic-unfetch";
import {
  ProjectLocale,
  PullOptions,
  PushOptions,
  Translations,
} from "../../types";

const fetchApi = async <T>(path: string, opts = {}) => {
  const response = await fetch(`https://localise.biz/api${path}`, opts);
  if (!response.ok) {
    throw new Error(`HTTPError: ${response.status} ${response.statusText}`);
  }
  const json = (await response.json()) as T;
  return json;
};

export const apiPull = async (key: string, options: PullOptions = {}) => {
  const translations = await fetchApi<Translations>(
    `/export/all.json?${new URLSearchParams({ key, ...options }).toString()}`
  );
  const locales = await fetchApi<ProjectLocale[]>(
    `/locales?${new URLSearchParams({ key }).toString()}`
  );
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
    `/import/json?
  ${new URLSearchParams({
    key,
    locale,
    ...Object.keys(options).reduce(
      (acc, key) => ({
        ...acc,
        [key]: options[key as keyof PushOptions]?.toString(),
      }),
      {}
    ),
  }).toString()}`,
    {
      method: "POST",
      body: JSON.stringify(translations),
    }
  );
