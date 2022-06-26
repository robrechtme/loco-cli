import chalk from "chalk";
import { truncateString } from "./string";

export const printDiff = ({
  added,
  updated,
  deleted,
}: {
  added?: Record<string, string>;
  deleted?: Record<string, string>;
  updated?: Record<string, string>;
}) =>
  [
    printAssets(
      added,
      chalk.greenBright(chalk.dim("   added ") + chalk.bold("+"))
    ),
    printAssets(
      updated,
      chalk.yellowBright(chalk.dim("modified ") + chalk.bold("~"))
    ),
    printAssets(deleted, chalk.red(chalk.dim(" deleted ") + chalk.bold("-"))),
  ]
    .filter(Boolean)
    .join("\n");

export const printAssets = (
  assets: Record<string, string> | undefined,
  prefix?: string
) => {
  if (!assets || Object.keys(assets).length < 1) {
    return "";
  }
  return Object.entries(assets)
    .slice(0, 20)
    .map(([key, value]) => {
      const [locale, ...asset] = key.split(".");
      return `${prefix} ${chalk.dim(`(${locale})`)} ${chalk.bold(
        asset.join(".")
      )}${value ? chalk.cyan(` (${truncateString(value)})`) : ""}`;
    })
    .join("\n");
};
