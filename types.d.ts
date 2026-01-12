export interface PullOptions {
  /**
   * Filter assets by comma-separated tag names. Match any tag with `*` and negate tags by prefixing with `!`.
   * @see https://localise.biz/api/docs/export/exportall#query
   */
  filter?: string;
  /**
   * Fallback locale for untranslated assets, specified as short code. e.g. en or en_GB.
   * @see https://localise.biz/api/docs/export/exportall#query
   */
  fallback?: string;
  /**
   * Export translations according to asset order.
   * @see https://localise.biz/api/docs/export/exportall#query
   */
  order?: 'created' | 'id';
  /**
   * Export translations with a specific status or flag. Negate values by prefixing with !. e.g. "translated", or "!fuzzy".
   * @see https://localise.biz/api/docs/export/exportall#query
   */
  status?: string;
  /**
   * Specify preferred character encoding. Alternative to Accept-Charset header but accepts a single value which must be valid.
   * @see https://localise.biz/api/docs/export/exportall#query
   */
  charset?: string;
  /**
   * Force platform-specific line-endings. Default is Unix (LF) breaks.
   * @see https://localise.biz/api/docs/export/exportall#query
   */
  breaks?: 'Unix' | 'DOS' | 'Mac';
}

export interface PushOptions {
  /**
   * Specify that new assets will NOT be added to the project.
   * @see https://localise.biz/api/docs/import/import#query
   */
  'ignore-new'?: boolean;
  /**
   * Specify that existing assets encountered in the file will NOT be updated.
   * @see https://localise.biz/api/docs/import/import#query
   */
  'ignore-existing'?: boolean;
  /**
   * Tag any NEW assets added during the import with the given tags (comma separated).
   * @see https://localise.biz/api/docs/import/import#query
   */
  'tag-new'?: string;
  /**
   * Tag ALL assets in the file with the given tags (comma separated).
   * @see https://localise.biz/api/docs/import/import#query
   */
  'tag-all'?: string;
  /**
   * Remove existing tags from any assets matched in the imported file (comma separated).
   * @see https://localise.biz/api/docs/import/import#query
   */
  'untag-all'?: string;
  /**
   * Tag existing assets that are MODIFIED by this import.
   * @see https://localise.biz/api/docs/import/import#query
   */
  'tag-updated'?: string;
  /**
   * Remove existing tags from assets that are MODIFIED during import.
   * @see https://localise.biz/api/docs/import/import#query
   */
  'untag-updated'?: string;
  /**
   * Tag existing assets in the project that are NOT found in the imported file.
   * @see https://localise.biz/api/docs/import/import#query
   */
  'tag-absent'?: string;
  /**
   * Remove existing tags from assets NOT found in the imported file.
   * @see https://localise.biz/api/docs/import/import#query
   */
  'untag-absent'?: string;
  /**
   * Permanently DELETES project assets NOT found in the file (use with extreme caution).
   * @see https://localise.biz/api/docs/import/import#query
   */
  'delete-absent'?: boolean;
  /**
   * Set this flag on any NEW (non-empty) translations imported into the current locale.
   * @see https://localise.biz/api/docs/import/import#query
   */
  'flag-new'?: string;
}

export interface Config {
  /**
   * The API key of the Loco project you wish to sync to/from.
   * You can find this in the Loco project under `Developer
   * Tools › API Keys › Full Access Key` (if you do not
   * intend to use `loco-cli push`, an `Export key` will
   * work too). */
  accessKey: string;
  /**
   * The folder in which the JSON translation files are
   * stored (defaults to current working dir).
   */
  localesDir: string;
  /** @deprecated since v2 all languages are used */
  defaultLanguage?: string;
  /**
   * Organize translations into namespaces (default: `false`).
   * Set this flag to `true` when dividing translations into
   * multiple files. The uploaded asset ID's will be
   * prefixed with `<namespace>:`. */
  namespaces: boolean;
  /**
   * Maximum number of modified files to display (defaults to 20).
   */
  maxFiles?: number;
  /**
   * Options for the `loco-cli push` command.
   */
  push?: PushOptions;
  /**
   * Options for the `loco-cli pull` command.
   */
  pull?: PullOptions;
}

export type Locale = string;

export type Translations = Record<Locale, object>;

export type ProjectLocale = {
  code: string;
};
