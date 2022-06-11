import { Command } from "commander";

import { getGlobalOptions } from "../util/options";
import { truncateString } from "../util/string";
import { readFiles } from "../lib/readFiles";
import { apiPull } from "../lib/api";
import { diff } from "../lib/diff";
import chalk from "chalk";
import { printAssets } from "../util/print";
import { exitError, exitSuccess } from "../util/exit";

interface CommandOptions {
  direction: "remote" | "local" | "both";
}

const status = async ({ direction }: CommandOptions, program: Command) => {
  const {
    accessKey,
    localesDir,
    namespaces,
    pull: pullOptions,
  } = getGlobalOptions(program);
  const local = await readFiles(localesDir, namespaces);
  const remote = await apiPull(accessKey, pullOptions);
  const { added, deleted, updated } = diff(remote, local);

  let isDirty = false;

  console.log();

  if (["both", "remote"].includes(direction) && Object.keys(added).length) {
    isDirty = true;
    console.log(
      `${chalk.bold(
        Object.keys(added).length
      )} local assets are not present remote (fix with \`loco-cli push\`): 
${printAssets(added, chalk.greenBright(chalk.bold("+")))}
  `
    );
  }

  if (["both", "local"].includes(direction) && Object.keys(updated).length) {
    isDirty = true;
    console.log(
      `${chalk.bold(
        Object.keys(updated).length
      )} translations are different remotely: 
${printAssets(updated, chalk.yellow(chalk.bold("~")))}
  `
    );
  }

  if (["both", "local"].includes(direction) && Object.keys(deleted).length) {
    isDirty = true;
    console.log(
      `${chalk.bold(
        Object.keys(deleted).length
      )} remote assets are not present locally (fix with \`loco-cli pull\`):
${printAssets(deleted, chalk.red(chalk.bold("-")))}
  `
    );
  }

  if (isDirty) {
    exitError();
  } else {
    exitSuccess("Everything up to date!");
  }
};

export default status;
