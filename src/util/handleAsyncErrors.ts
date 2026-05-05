import chalk from 'chalk';
import { CliError, HTTPError } from './errors';

export const handleAsyncErrors = <T extends unknown[]>(fn: (...args: T) => Promise<void>) => {
  return (...args: T) =>
    fn(...args).catch((error: Error) => {
      process.exitCode = 1;
      // CliError: caller already printed a user-facing message
      if (error instanceof CliError) {
        return;
      }
      if (error instanceof HTTPError && error.status === 401) {
        console.log(
          `\n${chalk.red(
            '✗ Invalid access key. Make sure to use a Full access key.\nSee https://localise.biz/help/developers/api-keys#writeable for more info.\n'
          )}`
        );
      } else {
        console.log(chalk.red(`\n✗ An unexpected error occurred:\n  ${error.message}\n`));
      }
    });
};
