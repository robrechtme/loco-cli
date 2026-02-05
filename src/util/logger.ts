import chalk from 'chalk';

export const log = {
  log: console.log,
  info: (msg: string, ...args: unknown[]) => console.log(`💡 ${msg}`, ...args),
  warn: (msg: string, ...args: unknown[]) => console.warn(`⚠️ ${msg}`, ...args),
  error: (msg: string, ...args: unknown[]) => console.error(`${chalk.red('✗')} ${msg}`, ...args),
  success: (msg: string, ...args: unknown[]) => console.log(`${chalk.green('✔')} ${msg}`, ...args)
};
