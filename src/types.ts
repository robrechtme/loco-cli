export interface GlobalOptions {
  accessKey: string;
  localesDir: string;
  defaultLanguage: string;
  namespaces: boolean;
}

export type Locale = string;

export type Translations = Record<Locale, object>;
