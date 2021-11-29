import Loco from "loco-api-js";
import getStatus from "../util/getStatus";
import chalk from "chalk";

interface Options {
  apiToken: string;
}

const printAsset = (key: string) => {
  return `- ${chalk.cyan(key)}\n`;
};

const status = async (inputFile: string, { apiToken }: Options) => {
  const loco = new Loco(apiToken);
  const json = await import(inputFile).then((module) => module.default);
  const { missingLocal, missingRemote } = await getStatus(loco, json);

  const missingLocalIDs = Object.keys(missingLocal);
  const missingRemoteIDs = Object.keys(missingRemote);
  if (missingLocalIDs.length) {
    console.log(
      `Found assets locally which are not present remote: 
${missingLocalIDs.map(printAsset).join("")}
  `
    );
  }
  if (missingRemoteIDs.length) {
    console.log(
      `Found assets remote which are not present locally:
${missingRemoteIDs.map(printAsset).join("")}
  `
    );
  }
};

export default status;
