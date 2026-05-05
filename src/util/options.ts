import type { Command } from 'commander';
import type { Config } from '../../types';
import { readConfig } from './config';
import { CliError } from './errors';
import { log } from './logger';

export const getGlobalOptions = async (program: Command): Promise<Config> => {
  if (!program.parent) {
    log.error('Something went wrong. Sorry!');
    throw new CliError('options: no parent command');
  }
  const cliOptions = program.parent.opts<Partial<Config>>();

  const fileOptions = await readConfig();

  const hasFileOptions = Object.keys(fileOptions).length;

  if (!fileOptions.accessKey && !cliOptions.accessKey) {
    log.error(
      'No personal access token found. Provide one with the `-a` option, or in the config file.'
    );
    throw new CliError('options: missing access key');
  }

  if (hasFileOptions) {
    log.log('🔍  Reading from config file');
  }

  if (fileOptions.defaultLanguage) {
    log.warn(
      'The `defaultLanguage` option is deprecated. Starting from v2, all languages are used.'
    );
  }
  // CLI flags override config file values (only when explicitly provided).
  // Note: merge deep when options will be nested.
  const definedCliOptions = Object.fromEntries(
    Object.entries(cliOptions).filter(([, v]) => v !== undefined)
  );
  const mergedOptions: Partial<Config> = {
    ...fileOptions,
    ...definedCliOptions
  };

  // Parse maxFiles as a number if it's provided as a string
  if (mergedOptions.maxFiles && typeof mergedOptions.maxFiles === 'string') {
    mergedOptions.maxFiles = parseInt(mergedOptions.maxFiles, 10);
  }

  // accessKey is validated above; provide defaults for required fields
  return {
    ...mergedOptions,
    accessKey: mergedOptions.accessKey!,
    localesDir: mergedOptions.localesDir ?? '.',
    namespaces: mergedOptions.namespaces ?? false
  };
};
