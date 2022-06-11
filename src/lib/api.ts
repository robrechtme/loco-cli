import fetch from "isomorphic-unfetch";
import { Translations } from "../types";

const fetchApi = async <T>(path: string, opts = {}) => {
  const response = await fetch(`https://localise.biz/api${path}`, opts);
  if (!response.ok) {
    throw new Error(`HTTPError: ${response.status} ${response.statusText}`);
  }
  const json = (await response.json()) as T;
  return json;
};

export const apiPull = (key: string) =>
  fetchApi<Translations>(`/export/all.json?key=${key}`);

export const apiPush = (
  key: string,
  locale: string,
  translations: Translations[string]
) =>
  fetchApi<void>(`/import/json?key=${key}&locale=${locale}`, {
    method: "POST",
    body: JSON.stringify(translations),
  });
