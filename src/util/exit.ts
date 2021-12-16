import chalk from "chalk";

const exit = (msg: string, code = 1) => {
  console.log(`${chalk.red("✖")} ${msg}`);
  process.exit(code);
};

export default exit;
