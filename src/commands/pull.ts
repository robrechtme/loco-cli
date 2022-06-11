import { Command, CommandOptions } from "commander";
import { diff } from "../lib/diff";
import { readFiles } from "../lib/readFiles";
import { getGlobalOptions } from "../util/options";
import { apiPull as apiPull } from "../lib/api";
import inquirer from "inquirer";
import exit from "../util/exit";
import chalk from "chalk";
import { printAssets, printDiff } from "../util/print";
import { writeFiles } from "../lib/writeFiles";

const pull = async (_: CommandOptions, program: Command) => {
  const options = getGlobalOptions(program);
  const { accessKey, localesDir, namespaces } = options;
  const local = await readFiles(localesDir, namespaces);
  const remote = await apiPull(accessKey);

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
    return exit("Nothing pulled", 0);
  }

  writeFiles(remote, options);
  console.log(
    ` ${chalk.green("✔")}  Wrote files to ${chalk.bold(localesDir)}.`
  );
};

export default pull;
