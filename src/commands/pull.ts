import Loco from "loco-api-js";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { getGlobalOptions } from "../util/options";
import { Command } from "commander";
interface CommandOptions {}

const pull = async (_: CommandOptions, program: Command) => {
  const { accessKey, localesDir: folder } = getGlobalOptions(program);
  const loco = new Loco(accessKey);

  console.log("☁️  Downloading assets...");
  const res = await loco.doExport();

  fs.mkdirSync(folder, { recursive: true });

  console.log();
  console.log(folder);
  const length = Object.keys(res).length;
  let i = 1;
  for (const [language, assets] of Object.entries(res)) {
    console.log(`${i++ === length ? "└──" : "├──"} ${language}.json`);
    const filePath = path.join(folder, `${language}.json`);
    fs.writeFileSync(filePath, JSON.stringify(assets, null, 2));
  }

  console.log();
  console.log(
    `${chalk.green("✔")} Downloaded assets in ${chalk.bold(
      Object.keys(res).length
    )} languages.`
  );
};

export default pull;
