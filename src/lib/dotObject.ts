import { DiffRecord, TranslationValue, Translations } from '../../types';

type DiffValue = string | undefined;
type DiffObject = { [key: string]: DiffValue | DiffObject };

/**
 * Transform nested JS object to key-value pairs using dot notation.
 * Handles undefined values from diff operations (representing deletions).
 */
export const dotObject = (obj: TranslationValue | DiffObject): DiffRecord => {
  const res: DiffRecord = {};

  function recurse(current: TranslationValue | DiffObject, keyPrefix?: string) {
    for (const key of Object.keys(current)) {
      const value = current[key];
      const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
      if (value !== undefined && typeof value === 'object') {
        // it's a nested object, so do it again
        recurse(value, newKey);
      } else {
        // it's a string or undefined (deletion marker)
        res[newKey] = value;
      }
    }
  }
  recurse(obj);
  return res;
};

/**
 * Transform nested JS object to key-value pairs using dot notation.
 * Use this version when you know the input contains only strings (no diff undefined values).
 */
export const flattenTranslations = (obj: TranslationValue): Record<string, string> => {
  const res: Record<string, string> = {};

  function recurse(current: TranslationValue, keyPrefix?: string) {
    for (const key of Object.keys(current)) {
      const value = current[key];
      if (value === undefined) continue;
      const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
      if (typeof value === 'object') {
        recurse(value, newKey);
      } else {
        res[newKey] = value;
      }
    }
  }
  recurse(obj);
  return res;
};

/**
 * Flatten all translations for all locales at once.
 * Returns a Record mapping locale codes to their flattened translations.
 */
export const flattenAllTranslations = (
  translations: Translations
): Record<string, Record<string, string>> =>
  Object.fromEntries(
    Object.entries(translations).map(([locale, values]) => [locale, flattenTranslations(values)])
  );
