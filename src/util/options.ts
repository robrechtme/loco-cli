import { Command } from "commander";
import type { Config } from "../../types";
import { readConfig } from "./config";
import { log } from "./logger";

export const getGlobalOptions = async (program: Command): Promise<Config> => {
  if (!program.parent) {
    log.error("Something went wrong. Sorry!");
    process.exit(1);
  }
  const cliOptions = program.parent.opts();

  const fileOptions = await readConfig();

  const hasFileOptions = Object.keys(fileOptions).length;

  if (!fileOptions.accessKey && !cliOptions.accessKey) {
    log.error(
      "No personal access token found. Provide one with the `-a` option, or in the config file."
    );
    process.exit(1);
  }

  if (hasFileOptions) {
    log.log("🔍  Reading from config file");
  }

  if (fileOptions.defaultLanguage) {
    log.warn(
      "The `defaultLanguage` option is deprecated. Starting from v2, all languages are used."
    );
  }
  // Note: merge deep when options will be nested
  return {
    ...cliOptions,
    ...fileOptions,
  };
};
