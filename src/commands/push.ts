import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import cliProgress from "cli-progress";
import { apiPull, apiPush } from "../lib/api";
import { diff } from "../lib/diff";
import { readFiles } from "../lib/readFiles";
import exit from "../util/exit";
import { getGlobalOptions } from "../util/options";
import { printDiff } from "../util/print";

interface CommandOptions {
  status?: string;
  tag?: string;
  yes?: boolean;
}

const push = async ({ status, tag, yes }: CommandOptions, program: Command) => {
  const options = getGlobalOptions(program);
  const { accessKey, localesDir, namespaces } = options;
  const local = await readFiles(localesDir, namespaces);
  const remote = await apiPull(accessKey);
  const { added, deleted, updated } = diff(remote, local);

  console.log(`
Pushing will have the following effect:
${printDiff({ added, updated })}
`);

  if (Object.keys(deleted).length) {
    console.log("Pushing will not delete");
  }

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Continue?`,
    },
  ]);

  if (!confirm && !yes) {
    return exit("Nothing pushed", 0);
  }

  const length = Object.keys(remote).length;
  const progressbar = new cliProgress.SingleBar({
    format: `Uploading ${length} locales |${chalk.cyan(
      "{bar}"
    )}| {value}/{total}`,
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });
  progressbar.start(length, 0);
  for (const [locale, translations] of Object.entries(local)) {
    progressbar.increment();
    await apiPush(accessKey, locale, translations);
  }
  progressbar.stop();

  console.log();
  console.log(`${chalk.green("✔")} All done.`);
  console.log(
    `${chalk.yellow(
      "⚠️"
    )}   Be kind to our translators, provide a note in the \`Notes\` field when there is not enough context.`
  );
};

export default push;
