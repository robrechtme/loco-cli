import { Command } from "commander";
import rcfile from "rcfile";
import exit from "./exit";

export const getGlobalOptions = (program: Command) => {
  if (program.parent) {
    const cliOptions = program.parent?.opts();
    const fileOptions = rcfile("loco");

    if (!fileOptions.personalAccessToken && !cliOptions.personalAccessToken) {
      exit(
        "No personal access token found. Provide one with the `-p` option, or in the `.locorc` config file."
      );
    }
    if (fileOptions.personalAccessToken) {
      console.log("Reading from config file");
    }
    // FIXME: merge deep
    return {
      ...cliOptions,
      ...fileOptions,
    };
  }
  return {};
};
