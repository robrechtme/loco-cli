import { existsSync, readdirSync, statSync } from 'fs';
import { readFile } from 'fs';
import { join } from 'path';
import { Translations } from '../../types';
import { log } from '../util/logger';

const readJSON = async (path: string) => {
  if (!existsSync(path)) {
    log.error(`File not found: ${path}`);
    process.exit(1);
  }

  return new Promise((resolve, reject) => {
    readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(data));
    });
  }) as Promise<Record<string, string>>;
};

const readFilesInDir = async (path: string, separator?: string) => {
  const res = {};
  if (!existsSync(path)) {
    log.error(`Directory not found: "${path}"`);
    process.exit(1);
  }
  const files = readdirSync(path);

  await Promise.all(
    files.map(async file => {
      if (file.endsWith('.json')) {
        const json = await readJSON(join(path, file));
        Object.keys(json).forEach(key => {
          // @ts-expect-error Element implicitly has an any type because expression of type string can't be used to index type {}.
          res[`${file.replace('.json', '')}${separator}${key}`] = json[key];
        });
      }
    })
  );
  return res;
};

export const readFiles = async (dir: string, useNamespaces: boolean): Promise<Translations> => {
  if (!existsSync(dir)) {
    return {};
  }
  const translations: Translations = {};
  const locales = readdirSync(dir);
  if (!locales.length) {
    return {};
  }
  await Promise.all(
    locales.map(async locale => {
      const localeDir = join(dir, locale);
      if (useNamespaces) {
        // using namespaces; locales should be folders
        if (statSync(localeDir).isDirectory()) {
          translations[locale] = await readFilesInDir(localeDir, ':');
        }
      } else {
        // using namespaces; locales shoud be JSON files
        if (locale.endsWith('.json')) {
          translations[locale.replace('.json', '')] = await readJSON(join(dir, locale));
        }
      }
    })
  );
  return translations;
};
