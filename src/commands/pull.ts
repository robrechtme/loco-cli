import Loco from "loco-api-js";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { getGlobalOptions } from "../util/options";
import { Command, CommandOptions } from "commander";
import { splitIntoNamespaces } from "../util/namespaces";

const pull = async (_: CommandOptions, program: Command) => {
  const { accessKey, localesDir, namespaces } = getGlobalOptions(program);
  const loco = new Loco(accessKey);

  console.log("☁️   Downloading assets...");
  const res = await loco.doExport();

  fs.mkdirSync(localesDir, { recursive: true });

  for (const [language, assets] of Object.entries(res)) {
    if (namespaces) {
      fs.mkdirSync(path.join(localesDir, language), { recursive: true });

      const availableNamespaces = splitIntoNamespaces(assets);
      for (const [namespace, scopedAssets] of Object.entries(
        availableNamespaces
      )) {
        const filePath = path.join(localesDir, language, `${namespace}.json`);
        fs.writeFileSync(filePath, JSON.stringify(scopedAssets, null, 2));
      }
    } else {
      const filePath = path.join(localesDir, `${language}.json`);
      fs.writeFileSync(filePath, JSON.stringify(assets, null, 2));
    }
  }

  console.log(
    ` ${chalk.green("✔")}  Downloaded assets in ${chalk.bold(
      Object.keys(res).length
    )} languages.`
  );
};

export default pull;
