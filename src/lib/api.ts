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

export interface PullOptions {
  /**	Filter assets by comma-separated tag names. Match any tag with * and negate tags by prefixing with ! */
  filter?: string;
  /**	Fallback locale for untranslated assets, specified as short code. e.g. en or en_GB */
  fallback?: string;
  /**	Export translations according to asset order */
  order?: "created" | "id";
  /**	Export translations with a specific status or flag. Negate values by prefixing with !. e.g. "translated", or "!fuzzy". */
  status?: string;
  /**	Specify preferred character encoding. Alternative to Accept-Charset header but accepts a single value which must be valid. */
  charset?: string;
  /**	Force platform-specific line-endings. Default is Unix (LF) breaks. */
  breaks?: "Unix" | "DOS" | "Mac";
}

export const apiPull = (key: string, options: PullOptions = {}) =>
  fetchApi<Translations>(
    `/export/all.json?${new URLSearchParams({ key, ...options }).toString()}`
  );

export interface PushOptions {
  /**	Specify that new assets will NOT be added to the project */
  "ignore-new"?: boolean;
  /**	Specify that existing assets encountered in the file will NOT be updated */
  "ignore-existing"?: boolean;
  /**Tag any NEW assets added during the import with the given tags (comma separated) */
  "tag-new"?: string;
  /**	Tag ALL assets in the file with the given tags (comma separated) */
  "tag-all"?: string;
  /**	Remove existing tags from any assets matched in the imported file (comma separated) */
  "untag-all"?: string;
  /**	Tag existing assets that are MODIFIED by this import */
  "tag-updated"?: string;
  /**	Remove existing tags from assets that are MODIFIED during import */
  "untag-updated"?: string;
  /**	Tag existing assets in the project that are NOT found in the imported file */
  "tag-absent"?: string;
  /**	Remove existing tags from assets NOT found in the imported file */
  "untag-absent"?: string;
  /**	Permanently DELETES project assets NOT found in the file (use with extreme caution) */
  "delete-absent"?: boolean;
  /**	Set this flag on any NEW (non-empty) translations imported into the current locale. */
  "flag-new"?: string;
}

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
