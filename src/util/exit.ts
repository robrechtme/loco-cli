import chalk from "chalk";

const exit = (msg: string) => {
  console.log(`${chalk.red("✖")} ${msg}`);
  process.exit(1);
};

export default exit;
