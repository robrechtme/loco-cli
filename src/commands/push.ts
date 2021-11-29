import Loco from "loco-api-js";
import getStatus from "../util/getStatus";
import cliProgress from "cli-progress";

const uploadAsset = async (
  loco: Loco,
  key: string,
  value: string,
  { status = "provisional", tag = undefined } = {}
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

interface Options {
  apiToken: string;
}

const push = async (inputFile: string, { apiToken }: Options) => {
  const loco = new Loco(apiToken);
  const json = await import(inputFile).then((module) => module.default);
  const { missingRemote } = await getStatus(loco, json);
  const progressbar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progressbar.start(Object.keys(missingRemote).length, 0);
  for (const [key, value] of Object.entries(missingRemote)) {
    progressbar.increment();
    await uploadAsset(loco, key, value);
  }
  progressbar.stop();
};

export default push;
