import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import cliProgress from "cli-progress";
import { apiPull, apiPush } from "../lib/api";
import { diff } from "../lib/diff";
import { readFiles } from "../lib/readFiles";
import { getGlobalOptions } from "../util/options";
import { printDiff } from "../util/print";
import { exitError, exitSuccess } from "../util/exit";
import { dotObject } from "../lib/dotObject";

interface CommandOptions {
  yes?: boolean;
}

const push = async ({ yes }: CommandOptions, program: Command) => {
  const options = getGlobalOptions(program);
  const {
    accessKey,
    localesDir,
    namespaces,
    push: pushOptions,
    pull: pullOptions,
  } = options;
  const deleteAbsent = pushOptions["delete-absent"] ?? false;
  const local = await readFiles(localesDir, namespaces);
  const remote = await apiPull(accessKey, pullOptions);
  const { added, deleted, updated, totalCount, deletedCount } = diff(
    remote,
    local
  );

  if (!totalCount || (!deleteAbsent && totalCount === deletedCount)) {
    console.log(
      `\n💡 Pushing will not delete remote assets when the ${chalk.bold(
        "delete-abscent"
      )} flag is disabled`
    );
    exitSuccess("Everything up to date!");
  }

  if (!yes) {
    console.log(`
Pushing will have the following effect:
${printDiff({
  added,
  updated,
  deleted: pushOptions["delete-absent"] ? deleted : undefined,
})}
`);

    if (deletedCount) {
      if (pushOptions["delete-absent"]) {
        console.log(
          `⚠️ ${chalk.bold("delete-abscent")} enabled, proceed with caution!\n`
        );
      } else {
        console.log(
          `💡 Pushing will not delete remote assets when the ${chalk.bold(
            "delete-abscent"
          )} flag is disabled\n`
        );
      }
    }

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Continue?",
      },
    ]);

    if (!confirm) {
      return exitError("Nothing pushed", 0);
    }
  }

  console.log();

  const length = Object.keys(remote).length;
  const progressbar = new cliProgress.SingleBar({
    format: `Uploading in ${length} locales |${chalk.cyan(
      "{bar}"
    )}| {value}/{total}`,
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });
  progressbar.start(length, 0);
  for (const [locale, translations] of Object.entries(local)) {
    progressbar.increment();
    await apiPush(accessKey, locale, dotObject(translations), pushOptions);
  }
  progressbar.stop();

  console.log();

  console.log(
    `${chalk.yellow(
      "⚠️"
    )}   Be kind to our translators, provide a note in the \`Notes\` field when there is not enough context.`
  );
  exitSuccess("All done.");
};

export default push;
