import Loco from "loco-api-js";
import getStatus from "../util/getStatus";
import cliProgress from "cli-progress";
import { getGlobalOptions } from "../util/options";
import { Command } from "commander";
import { importJSON } from "../util/file";
import chalk from "chalk";

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
}

const push = async (
  inputFile: string,
  { status, tag }: CommandOptions,
  program: Command
) => {
  const { personalAccessToken } = getGlobalOptions(program);
  const loco = new Loco(personalAccessToken);

  const json = importJSON(inputFile);

  const { missingRemote } = await getStatus(loco, json);
  const length = Object.keys(missingRemote).length;

  if (!length) {
    console.log(`${chalk.green("✔")} Already up to date!`);
    return;
  }
  console.log(`Uploading ${length} assets.`);

  const progressbar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progressbar.start(length, 0);
  for (const [key, value] of Object.entries(missingRemote)) {
    progressbar.increment();
    await uploadAsset(loco, key, value, {
      status,
      tag,
    });
  }
  progressbar.stop();
};

export default push;
