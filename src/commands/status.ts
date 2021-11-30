import Loco from "loco-api-js";
import fs from "fs";
import chalk from "chalk";
import { Command } from "commander";

import getStatus from "../util/getStatus";
import { getGlobalOptions } from "../util/options";
import exit from "../util/exit";
import { importJSON } from "../util/file";

interface CommandOptions {}

const status = async (
  inputFile: string,
  _options: CommandOptions,
  program: Command
) => {
  const { personalAccessToken } = getGlobalOptions(program);
  const loco = new Loco(personalAccessToken);

  const json = await importJSON(inputFile);

  const { missingLocal, missingRemote } = await getStatus(loco, json);

  const missingLocalIDs = Object.keys(missingLocal);
  const missingRemoteIDs = Object.keys(missingRemote);

  if (!missingLocalIDs.length && !missingRemoteIDs.length) {
    console.log(`${chalk.green("✔")} Everything up to date!`);
    return;
  }

  if (missingRemoteIDs.length) {
    console.log(
      `
Found assets locally which are not present remote (fix with \`loco-cli push\`): 
${missingRemoteIDs
  .map((key) => `  ${chalk.greenBright(chalk.bold("+"))} ${key}`)
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
