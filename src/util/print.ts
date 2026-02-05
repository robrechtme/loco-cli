import chalk from 'chalk';
import { truncateString } from './string';

export const printDiff = ({
  added,
  updated,
  deleted,
  maxFiles = 20
}: {
  added?: Record<string, string>;
  deleted?: Record<string, string>;
  updated?: Record<string, string>;
  maxFiles?: number;
}) =>
  [
    printAssets(added, chalk.greenBright(chalk.dim('   added ') + chalk.bold('+')), maxFiles),
    printAssets(updated, chalk.yellowBright(chalk.dim('modified ') + chalk.bold('~')), maxFiles),
    printAssets(deleted, chalk.red(chalk.dim(' deleted ') + chalk.bold('-')), maxFiles)
  ]
    .filter(Boolean)
    .join('\n');

export const printAssets = (
  assets: Record<string, string> | undefined,
  prefix?: string,
  maxFiles: number = 20
) => {
  const amount = assets ? Object.keys(assets).length : 0;
  if (!assets || amount < 1) {
    return '';
  }
  const res = Object.entries(assets)
    .slice(0, maxFiles)
    .map(([key, value]) => {
      const [locale, ...asset] = key.split('.');
      return `${prefix} ${chalk.dim(`(${locale})`)} ${chalk.bold(
        asset.join('.')
      )}${value ? chalk.cyan(` (${truncateString(value)})`) : ''}`;
    })
    .join('\n');

  return amount > maxFiles ? `${res}\n...and ${chalk.bold(amount - maxFiles)} more` : res;
};
