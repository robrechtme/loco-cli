import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import cliProgress from "cli-progress";
import { apiPull, apiPush } from "../lib/api";
import { diff } from "../lib/diff";
import { readFiles } from "../lib/readFiles";
import { getGlobalOptions } from "../util/options";
import { printDiff } from "../util/print";
import { dotObject } from "../lib/dotObject";
import { log } from "../util/logger";

interface CommandOptions {
  yes?: boolean;
  status?: string;
  tag?: string;
}

const push = async ({ yes, status, tag }: CommandOptions, program: Command) => {
  if (status) {
    log.warn(
      "The status option is removed in v2, use the `push.flag-new` option in `loco.config.js` instead"
    );
  }
  if (tag) {
    log.warn(
      "The tag option is removed in v2, use the `push.tag-new` option in `loco.config.js` instead"
    );
  }
  const options = await getGlobalOptions(program);
  const {
    accessKey,
    localesDir,
    namespaces,
    push: pushOptions,
    pull: pullOptions,
  } = options;
  const deleteAbsent = pushOptions?.["delete-absent"] ?? false;
  const local = await readFiles(localesDir, namespaces);
  const remote = await apiPull(accessKey, pullOptions);
  const { added, deleted, updated, totalCount, deletedCount } = diff(
    remote,
    local
  );

  if (!totalCount || (!deleteAbsent && totalCount === deletedCount)) {
    log.info(
      `Pushing will not delete remote assets when the ${chalk.bold(
        "delete-abscent"
      )} flag is disabled`
    );
    log.success("Everything up to date!");
    process.exit(0);
  }

  if (!yes) {
    log.log(`
Pushing will have the following effect:
${printDiff({
  added,
  updated,
  deleted: deleteAbsent ? deleted : undefined,
})}
`);

    if (deletedCount) {
      if (deleteAbsent) {
        log.warn(
          `${chalk.bold("delete-abscent")} enabled, proceed with caution!\n`
        );
      } else {
        log.info(
          `Pushing will not delete remote assets when the ${chalk.bold(
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
      log.error("Nothing pushed");
      process.exit(0);
    }
  }

  log.log();

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

  log.log();

  log.warn(
    "Be kind to your translators, provide a note in the `Notes` field on Loco when there is not enough context."
  );
  log.success("All done.");
  process.exit(0);
};

export default push;
