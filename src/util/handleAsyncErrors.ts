import chalk from "chalk";

type Fun = (...args: any[]) => Promise<void>;

export const handleAsyncErrors = (fn: Fun) => {
  return (...args: any[]) =>
    fn(...args).catch((error) => {
      if (error.message === "HTTPError: 401 Authorization Required") {
        console.log(
          `\n${chalk.red(
            "✗ Invalid access key. Make sure to use a Full access key.\nSee https://localise.biz/help/developers/api-keys#writeable for more info.\n"
          )}`
        );
      } else {
        console.log(
          chalk.red(`\n✗ An unexpected error occurred:\n  ${error.message}\n`)
        );
      }
    });
};
