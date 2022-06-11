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

  if (!yes) {
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `
\nPulling will import the following:
${printDiff(diff(local, remote))}
\nContinue?`,
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
