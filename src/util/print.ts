import chalk from 'chalk';
import { truncateString } from './string';

export const printDiff = ({
  added,
  updated,
  deleted
}: {
  added?: Record<string, string>;
  deleted?: Record<string, string>;
  updated?: Record<string, string>;
}) =>
  [
    printAssets(added, chalk.greenBright(chalk.dim('   added ') + chalk.bold('+'))),
    printAssets(updated, chalk.yellowBright(chalk.dim('modified ') + chalk.bold('~'))),
    printAssets(deleted, chalk.red(chalk.dim(' deleted ') + chalk.bold('-')))
  ]
    .filter(Boolean)
    .join('\n');

export const printAssets = (assets: Record<string, string> | undefined, prefix?: string) => {
  const amount = assets ? Object.keys(assets).length : 0;
  if (!assets || amount < 1) {
    return '';
  }
  const res = Object.entries(assets)
    .slice(0, 20)
    .map(([key, value]) => {
      const [locale, ...asset] = key.split('.');
      return `${prefix} ${chalk.dim(`(${locale})`)} ${chalk.bold(
        asset.join('.')
      )}${value ? chalk.cyan(` (${truncateString(value)})`) : ''}`;
    })
    .join('\n');

  return amount > 20 ? `${res}\n...and ${chalk.bold(amount - 20)} more` : res;
};
