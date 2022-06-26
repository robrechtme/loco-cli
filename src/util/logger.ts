import chalk from "chalk";

export const log = {
  log: console.log,
  info: (msg: string, ...args: any) => console.log(`💡 ${msg}`, ...args),
  warn: (msg: string, ...args: any) => console.warn(`⚠️ ${msg}`, ...args),
  error: (msg: string, ...args: any) =>
    console.error(`${chalk.red("✗")} ${msg}`, ...args),
  success: (msg: string, ...args: any) =>
    console.log(`${chalk.green("✔")} ${msg}`, ...args),
};
