import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { Config, Translations } from "../types";
import { splitIntoNamespaces } from "../util/namespaces";

export const writeFiles = (translations: Translations, options: Config) => {
  const { localesDir, namespaces } = options;
  mkdirSync(localesDir, { recursive: true });

  for (const [language, assets] of Object.entries(translations)) {
    if (namespaces) {
      mkdirSync(join(localesDir, language), { recursive: true });

      const availableNamespaces = splitIntoNamespaces(assets);
      for (const [namespace, scopedAssets] of Object.entries(
        availableNamespaces
      )) {
        const filePath = join(localesDir, language, `${namespace}.json`);
        writeFileSync(filePath, JSON.stringify(scopedAssets, null, 2));
      }
    } else {
      const filePath = join(localesDir, `${language}.json`);
      writeFileSync(filePath, JSON.stringify(assets, null, 2));
    }
  }
};
