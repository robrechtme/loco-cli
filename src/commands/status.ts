import chalk from 'chalk';
import type { Command } from 'commander';
import { apiPull } from '../lib/api';
import { diff } from '../lib/diff';
import { readFiles } from '../lib/readFiles';
import { CliError } from '../util/errors';
import { log } from '../util/logger';
import { getGlobalOptions } from '../util/options';
import { printDiff } from '../util/print';

interface CommandOptions {
  direction: 'remote' | 'local' | 'both';
}

const status = async ({ direction }: CommandOptions, program: Command) => {
  const {
    accessKey,
    localesDir,
    namespaces,
    pull: pullOptions,
    maxFiles
  } = await getGlobalOptions(program);
  const local = await readFiles(localesDir, namespaces);
  const remote = await apiPull(accessKey, pullOptions);
  const { added, deleted, updated, totalCount, addedCount, deletedCount, updatedCount } = diff(
    remote,
    local
  );

  if (!totalCount) {
    log.success('Everything up to date!');
    return;
  }

  let isDirty = false;

  log.log();

  if (['both', 'remote'].includes(direction) && addedCount) {
    isDirty = true;
    log.log(
      `${chalk.bold(addedCount)} local assets are not present remote (fix with \`loco-cli push\`):
${printDiff({ added, maxFiles })}
  `
    );
  }

  if (['both', 'local'].includes(direction) && updatedCount) {
    isDirty = true;
    log.log(
      `${chalk.bold(updatedCount)} translations are different remotely:
${printDiff({ updated, maxFiles })}
      `
    );
  }

  if (['both', 'local'].includes(direction) && deletedCount) {
    isDirty = true;
    log.log(
      `${chalk.bold(
        deletedCount
      )} remote assets are not present locally (fix with \`loco-cli pull\`):
${printDiff({ deleted, maxFiles })}
  `
    );
  }

  if (isDirty) {
    throw new CliError('status: dirty');
  }
  log.success('Everything up to date!');
};

export default status;
