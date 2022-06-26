import { Command } from "commander";
import rcfile from "rcfile";
import type { Config } from "../../types";
import { exitError } from "./exit";

export const getGlobalOptions = (program: Command): Config => {
  if (!program.parent) {
    return exitError("Something went wrong. Sorry!");
  }
  const cliOptions = program.parent.opts();
  const fileOptions = rcfile("loco", { defaultExtension: ".json" });

  const hasFileOptions = Object.keys(fileOptions).length;

  if (!fileOptions.accessKey && !cliOptions.accessKey) {
    exitError(
      "No personal access token found. Provide one with the `-a` option, or in the `.locorc` config file."
    );
  }

  if (hasFileOptions) {
    console.log("🔍  Reading from `.locorc` config file");
  }

  if (fileOptions.defaultLanguage) {
    console.warn(
      "⚠️ The `defaultLanguage` option is deprecated. Starting from v2, all languages are used."
    );
  }
  // Note: merge deep when options will be nested
  return {
    ...cliOptions,
    ...fileOptions,
  };
};
