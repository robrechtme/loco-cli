import { Command } from "commander";
import { diff } from "../lib/diff";
import { readFiles } from "../lib/readFiles";
import { getGlobalOptions } from "../util/options";
import { apiPull as apiPull } from "../lib/api";
import inquirer from "inquirer";
import chalk from "chalk";
import { printDiff } from "../util/print";
import { writeFiles } from "../lib/writeFiles";
import { exitError, exitSuccess } from "../util/exit";

interface CommandOptions {
  yes?: boolean;
}

const pull = async ({ yes }: CommandOptions, program: Command) => {
  const options = getGlobalOptions(program);
  const { accessKey, localesDir, namespaces, pull: pullOptions } = options;
  const local = await readFiles(localesDir, namespaces);
  const remote = await apiPull(accessKey, pullOptions);

  const { added, updated, deleted, totalCount: count } = diff(local, remote);
  if (!count) {
    exitSuccess("Everything up to date!");
  }

  if (!yes) {
    console.log(`
Pulling will have the following effect:
${printDiff({ added, updated, deleted })}
    `);
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Continue?",
      },
    ]);

    if (!confirm) {
      return exitError("Nothing pulled", 0);
    }
  }

  writeFiles(remote, options);
  exitSuccess(`Wrote files to ${chalk.bold(localesDir)}.`);
};

export default pull;
