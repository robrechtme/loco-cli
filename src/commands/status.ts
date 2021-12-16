import Loco from "loco-api-js";
import fs from "fs";
import chalk from "chalk";
import { Command } from "commander";

import getStatus from "../util/getStatus";
import { getGlobalOptions } from "../util/options";
import { importDir, importJSON } from "../util/file";
import path from "path";
import { truncateString } from "../util/string";

interface CommandOptions {}

const status = async (_: CommandOptions, program: Command) => {
  const { accessKey, localesDir, defaultLanguage, namespaces } =
    getGlobalOptions(program);
  const loco = new Loco(accessKey);

  const translationsObject = namespaces
    ? await importDir(path.join(localesDir, defaultLanguage))
    : await importJSON(path.join(localesDir, `${defaultLanguage}.json`));

  const { missingLocal, missingRemote } = await getStatus(
    loco,
    translationsObject
  );

  const missingLocalIDs = Object.keys(missingLocal);
  const missingRemoteIDs = Object.keys(missingRemote);

  if (!missingLocalIDs.length && !missingRemoteIDs.length) {
    console.log(`${chalk.green("✔")} Everything up to date!`);
    return;
  }

  console.log();
  if (missingRemoteIDs.length) {
    console.log(
      `
Found assets locally which are not present remote (fix with \`loco-cli push\`): 
${missingRemoteIDs
  .map(
    (key) =>
      `  ${chalk.greenBright(chalk.bold("+"))} ${key} ${chalk.cyan(
        `(${truncateString(missingRemote[key], 20)})`
      )}`
  )
  .join("\n")}
  `
    );
  }
  if (missingLocalIDs.length) {
    console.log(
      `Found assets remote which are not present locally (fix with \`loco-cli pull\`):
${missingLocalIDs
  .map((key) => `  ${chalk.red(chalk.bold("-"))} ${key}`)
  .join("\n")}
  `
    );
  }
};

export default status;
