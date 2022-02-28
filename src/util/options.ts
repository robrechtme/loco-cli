import { Command } from "commander";
import rcfile from "rcfile";
import exit from "./exit";
import type { GlobalOptions } from "../types";

export const getGlobalOptions = (program: Command): GlobalOptions => {
  if (!program.parent) {
    return exit("Something went wrong. Sorry!");
  }
  const cliOptions = program.parent.opts();
  const fileOptions = rcfile("loco", { defaultExtension: ".json" });

  const hasFileOptions = Object.keys(fileOptions).length;

  if (!fileOptions.accessKey && !cliOptions.accessKey) {
    exit(
      "No personal access token found. Provide one with the `-a` option, or in the `.locorc` config file."
    );
  }

  if (hasFileOptions) {
    console.log("🔍  Reading from `.locorc` config file");
  }

  // Note: merge deep when options will be nested
  return {
    ...cliOptions,
    ...fileOptions,
  };
};
