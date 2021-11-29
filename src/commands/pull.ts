import Loco from "loco-api-js";
import fs from "fs";
import path from "path";
import chalk from "chalk";

interface Options {
  apiToken: string;
}

const pull = async (folder: string, { apiToken }: Options) => {
  const loco = new Loco(apiToken);
  const res = await loco.doExport();
  for (const [language, assets] of Object.entries(res)) {
    const filePath = path.join(folder, `${language}.json`);
    fs.writeFileSync(filePath, JSON.stringify(assets, null, 2));
  }
  console.log(
    `${chalk.green("✔")} Downloaded assets in ${chalk.bold(
      Object.keys(res).length
    )} languages.`
  );
};

export default pull;
