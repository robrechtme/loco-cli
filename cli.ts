#!/usr/bin/env node
import { Command } from "commander";

import pull from "./src/commands/pull";
import push from "./src/commands/push";
import status from "./src/commands/status";
import { version } from "./package.json";

const program = new Command("loco-cli")
  .version(version)
  .option("-a, --access-key <key>", "Loco API token")
  .option(
    "-d, --locales-dir <path>",
    "The folder in which the translations are stored.",
    "."
  )
  .option(
    "-l, --default-language <lang>",
    "Reference language to check which asset IDs are missing on Loco",
    "en"
  );

program.command("pull").description("Fetch assets from Loco").action(pull);

program
  .command("push")
  .option(
    "-t, --tag [tag]",
    'Tag to add to all newly uploaded assets, e.g. "1.1.0"'
  )
  .option(
    "-s, --status [status]",
    "Status to add to all newly uploaded assets",
    "provisional"
  )
  .description("Upload assets to Loco")
  .action(push);

program
  .command("status")
  .description("Check status of local file")
  .action(status);

program.parse(process.argv);
