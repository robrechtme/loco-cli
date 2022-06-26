import { statSync } from "fs";
import rcfile from "rcfile";
import { Config } from "../../types";
import path from "path";

const getConfigPath = () => path.resolve(process.cwd(), "loco.config.js");

export const readConfig = async (): Promise<Config> => {
  try {
    statSync(getConfigPath());
    return await import(getConfigPath());
  } catch {
    return rcfile("loco", { defaultExtension: ".json" });
  }
};
