import { Command } from "commander";

import { getGlobalOptions } from "../util/options";
import { readFiles } from "../lib/readFiles";
import { apiPull } from "../lib/api";
import { diff } from "../lib/diff";
import chalk from "chalk";
import { printDiff } from "../util/print";
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
    exitSuccess("Everything up to date!");
  }

  let isDirty = false;

  console.log();

  if (["both", "remote"].includes(direction) && addedCount) {
    isDirty = true;
    console.log(
      `${chalk.bold(
        addedCount
      )} local assets are not present remote (fix with \`loco-cli push\`): 
${printDiff({ added })}
  `
    );
  }

  if (["both", "local"].includes(direction) && updatedCount) {
    isDirty = true;
    console.log(
      `${chalk.bold(updatedCount)} translations are different remotely: 
${printDiff({ updated })}
      `
    );
  }

  if (["both", "local"].includes(direction) && deletedCount) {
    isDirty = true;
    console.log(
      `${chalk.bold(
        deletedCount
      )} remote assets are not present locally (fix with \`loco-cli pull\`):
${printDiff({ deleted })}
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
