import { PullOptions, PushOptions } from "./lib/api";

export interface Config {
  accessKey: string;
  localesDir: string;
  /** @deprecated since v2 all languages are used */
  defaultLanguage: string;
  namespaces: boolean;
  push: PushOptions;
  pull: PullOptions;
}

export type Locale = string;

export type Translations = Record<Locale, object>;
