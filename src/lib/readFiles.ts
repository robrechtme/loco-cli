import { existsSync, readdirSync, stat, statSync } from "fs";
import { readFile } from "fs";
import { join } from "path";
import { Translations } from "../types";
import { exitError } from "../util/exit";

const readJSON = async (path: string) => {
  if (!existsSync(path)) {
    exitError(`File not found: ${path}`);
  }

  return new Promise((resolve, reject) => {
    readFile(path, "utf8", (err, data) => {
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
    exitError(`Directory not found: "${path}"`);
  }
  const files = readdirSync(path);

  await Promise.all(
    files.map(async (file) => {
      if (file.endsWith(".json")) {
        const json = await readJSON(join(path, file));
        Object.keys(json).forEach((key) => {
          // @ts-expect-error
          res[`${file.replace(".json", "")}${separator}${key}`] = json[key];
        });
      }
    })
  );
  return res;
};

export const readFiles = async (
  dir: string,
  useNamespaces: boolean
): Promise<Translations> => {
  if (!existsSync(dir)) {
    throw new Error(`Directory not found: "${dir}"`);
  }
  const translations: Translations = {};
  const locales = readdirSync(dir);
  await Promise.all(
    locales.map(async (locale) => {
      const localeDir = join(dir, locale);
      if (useNamespaces) {
        // using namespaces; locales should be folders
        if (statSync(localeDir).isDirectory()) {
          translations[locale] = await readFilesInDir(localeDir, ":");
        }
      } else {
        // using namespaces; locales shoud be JSON files
        if (locale.endsWith(".json")) {
          translations[locale.replace(".json", "")] = await readJSON(
            join(dir, locale)
          );
        }
      }
    })
  );
  return translations;
};
