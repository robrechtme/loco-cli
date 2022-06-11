import chalk from "chalk";

export const exitError = (msg?: string, code = 1) => {
  if (msg) {
    console.log(`${chalk.red("✗")} ${msg}`);
  }
  process.exit(code);
};

export const exitSuccess = (msg: string) => {
  console.log(`${chalk.green("✔")} ${msg}`);
  process.exit(0);
};
