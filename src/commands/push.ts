import Loco from "loco-api-js";
import getStatus from "../util/getStatus";
import cliProgress from "cli-progress";
import { getGlobalOptions } from "../util/options";
import { Command } from "commander";
import { importDir, importJSON } from "../util/file";
import chalk from "chalk";
import path from "path";
import inquirer from "inquirer";
import { truncateString } from "../util/string";
import exit from "../util/exit";

interface UploadOptions {
  status?: string;
  tag?: string;
}

const uploadAsset = async (
  loco: Loco,
  key: string,
  value: string,
  { status, tag }: UploadOptions = {}
) => {
  const { id } = await loco.createAsset({
    id: key,
    text: value,
    default: status,
  });

  if (id !== key) {
    throw new Error(`Something went wrong while uploading asset "${key}"`);
  }
  if (tag) {
    return await loco.tagAsset(key, tag);
  }
  return;
};

interface CommandOptions {
  status?: string;
  tag?: string;
  yes?: boolean;
}

const push = async ({ status, tag, yes }: CommandOptions, program: Command) => {
  const { accessKey, localesDir, defaultLanguage, namespaces } =
    getGlobalOptions(program);
  const loco = new Loco(accessKey);

  const keyValue = namespaces
    ? await importDir(path.join(localesDir, defaultLanguage))
    : await importJSON(path.join(localesDir, `${defaultLanguage}.json`));

  const { missingRemote } = await getStatus(loco, keyValue);
  const length = Object.keys(missingRemote).length;

  if (!length) {
    console.log(`${chalk.green("✔")} Already up to date!`);
    return;
  }

  console.log(
    `
Found ${chalk.bold(
      length
    )} assets locally which are not present remote (fix with \`loco-cli push\`): 
${Object.keys(missingRemote)
  .map(
    (key) =>
      `  ${chalk.greenBright(chalk.bold("+"))} ${key} ${chalk.cyan(
        `(${truncateString(missingRemote[key], 20)})`
      )}`
  )
  .join("\n")}
`
  );

  if (!yes) {
    const { doUpload } = await inquirer.prompt([
      {
        type: "confirm",
        name: "doUpload",
        message: `Do you wish to upload these?`,
      },
    ]);

    if (!doUpload) {
      return exit("Nothing pushed", 0);
    }
  }

  const progressbar = new cliProgress.SingleBar({
    format: `Uploading ${length} assets |${chalk.cyan(
      "{bar}"
    )}| {value}/{total}`,
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });

  progressbar.start(length, 0);
  for (const [key, value] of Object.entries(missingRemote)) {
    progressbar.increment();
    await uploadAsset(loco, key, value, {
      status,
      tag,
    });
  }
  progressbar.stop();

  console.log();
  console.log(`${chalk.green("✔")} Uploaded ${length} assets.`);
  console.log(
    `${chalk.yellow(
      "⚠️"
    )}   Be kind to our translators, provide a note in the \`Notes\` field when there is not enough context.`
  );
};

export default push;
