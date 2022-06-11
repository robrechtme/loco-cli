import { Command } from "commander";

import { getGlobalOptions } from "../util/options";
import { truncateString } from "../util/string";
import { readFiles } from "../lib/readFiles";
import { apiPull } from "../lib/api";
import { diff } from "../lib/diff";
import { dotObject } from "../lib/dotObject";
import chalk from "chalk";
import { printAssets } from "../util/print";

interface CommandOptions {
  direction: "remote" | "local" | "both";
}

const status = async ({ direction }: CommandOptions, program: Command) => {
  const { accessKey, localesDir, namespaces } = getGlobalOptions(program);
  const local = await readFiles(localesDir, namespaces);
  const remote = await apiPull(accessKey);
  const { added, deleted, updated } = diff(remote, local);

  if (["both", "remote"].includes(direction)) {
    console.log(
      `\n${chalk.bold(
        Object.keys(added).length
      )} local assets are not present remote (fix with \`loco-cli push\`): 
${printAssets(added, chalk.greenBright(chalk.bold("+")))}
  `
    );
  }

  console.log(
    `${chalk.bold(
      Object.keys(updated).length
    )} translations are different remotely: 
${printAssets(updated, chalk.yellow(chalk.bold("~")))}
  `
  );

  console.log(
    `${chalk.bold(
      Object.keys(deleted).length
    )} remote assets are not present locally (fix with \`loco-cli pull\`):
${printAssets(deleted, chalk.red(chalk.bold("-")))}
  `
  );
};

export default status;
