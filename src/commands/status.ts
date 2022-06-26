import { Command } from "commander";

import { getGlobalOptions } from "../util/options";
import { readFiles } from "../lib/readFiles";
import { apiPull } from "../lib/api";
import { diff } from "../lib/diff";
import chalk from "chalk";
import { printDiff } from "../util/print";
import { log } from "../util/logger";

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
  const {
    added,
    deleted,
    updated,
    totalCount,
    addedCount,
    deletedCount,
    updatedCount,
  } = diff(remote, local);

  if (!totalCount) {
    log.success("Everything up to date!");
    process.exit(0);
  }

  let isDirty = false;

  log.log();

  if (["both", "remote"].includes(direction) && addedCount) {
    isDirty = true;
    log.log(
      `${chalk.bold(
        addedCount
      )} local assets are not present remote (fix with \`loco-cli push\`): 
${printDiff({ added })}
  `
    );
  }

  if (["both", "local"].includes(direction) && updatedCount) {
    isDirty = true;
    log.log(
      `${chalk.bold(updatedCount)} translations are different remotely: 
${printDiff({ updated })}
      `
    );
  }

  if (["both", "local"].includes(direction) && deletedCount) {
    isDirty = true;
    log.log(
      `${chalk.bold(
        deletedCount
      )} remote assets are not present locally (fix with \`loco-cli pull\`):
${printDiff({ deleted })}
  `
    );
  }

  if (isDirty) {
    process.exit(1);
  } else {
    log.success("Everything up to date!");
    process.exit(0);
  }
};

export default status;
