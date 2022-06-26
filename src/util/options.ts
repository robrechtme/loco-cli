import { Command } from "commander";
import rcfile from "rcfile";
import type { Config } from "../../types";
import { log } from "./logger";

export const getGlobalOptions = (program: Command): Config => {
  if (!program.parent) {
    log.error("Something went wrong. Sorry!");
    process.exit(1);
  }
  const cliOptions = program.parent.opts();
  const fileOptions = rcfile("loco", { defaultExtension: ".json" });

  const hasFileOptions = Object.keys(fileOptions).length;

  if (!fileOptions.accessKey && !cliOptions.accessKey) {
    log.error(
      "No personal access token found. Provide one with the `-a` option, or in the `.locorc` config file."
    );
    process.exit(1);
  }

  if (hasFileOptions) {
    log.log("🔍  Reading from `.locorc` config file");
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
